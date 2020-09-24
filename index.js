const express = require('express');
const { json } = require('body-parser');
const { existsSync, readFileSync } = require('fs');
const { ENCRYPT, CERTIFICATE, PRIVATE_KEY, HOST, PORT } = require('./env');
const activeDirectoryStrategy = require('./activeDirectoryStrategy');
const session = require('express-session');
const passport = require('passport');
const marked = require('marked');
const print = require('./print');
const http = require('http');
const https = require('https');

const readme = marked(readFileSync('./README.md', 'utf-8'));

// todo prevent using this
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const app = express();

app.use((error, _request, response, _next) => response.status(500).json({
    type: error.name || 'Error',
    message: error.message
}));

app.use(json({ strict: true }));

// todo make configurable
app.use(session({
    secret: 'EDITLATER',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 600000 }
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());

passport.use(activeDirectoryStrategy);

app.get('/', (_request, response) => response.send(readme));

app.post('/auth', passport.authenticate('ActiveDirectory', { failWithError: true }), (request, response) => response.json({
    error: null,
    user: request.user
}));

app.use('/print', (request, response, next) => {
    if (request.isAuthenticated()) next();
    else response.status(401).json({
        type: 'AuthenticationError',
        message: 'Not authenticated'
    })
}, print);

let server;
const serverCallback = () => {
    console.log(`Server listening on ${ENCRYPT ? 'https' : 'http'}://${HOST}:${PORT}`);
    process.once('exit', () => server.close());
}

if (!ENCRYPT)
    http.createServer(app).listen(PORT, HOST, serverCallback);
else if (!existsSync(CERTIFICATE) || !existsSync(PRIVATE_KEY))
    throw new Error('Could not load SSL certificate.');
else
    https.createServer({
        cert: readFileSync(CERTIFICATE, 'utf-8'),
        key: readFileSync(PRIVATE_KEY, 'utf-8')
    }, app).listen(PORT, HOST, serverCallback);