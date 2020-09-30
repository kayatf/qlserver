const express = require('express');
const { existsSync, readFileSync } = require('fs');
const { ENCRYPT, CERTIFICATE, PRIVATE_KEY, HOST, PORT, PROXY } = require('./env');
const activeDirectoryStrategy = require('./activeDirectoryStrategy');
const createHttpError = require('http-errors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { json } = require('body-parser');
const passport = require('passport');
const marked = require('marked');
const print = require('./print');
const http = require('http');
const https = require('https');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

const readme = marked(readFileSync('./README.md', 'utf-8'));

// todo prevent using this
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const app = express();

app.use(morgan(app.get('env') === 'production' ? 'tiny' : 'dev'));
if (PROXY)
    app.use('trust proxy', 1);
app.use(helmet());
app.use(cookieParser());
app.use(json());

app.use('/', cors({
    origin: true,
    credentials: true,
    exposedHeaders: ['set-cookie'],
}));

// todo make configurable
app.use(session({
    secret: 'EDITLATER',
    cookie: {
        maxAge: 600000,
        sameSite: 'lax',
        secure: ENCRYPT,
    },
    saveUninitialized: true,
    resave: true,
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());

passport.use(activeDirectoryStrategy)

app.all('/', (request, response, next) => {
    if (request.method !== 'GET')
        return next(createHttpError(405));
    response.send(readme);
});

app.all('/status', (request, response, next) => {
    if (request.method !== 'GET')
        return next(createHttpError(405));
    response.json({
        authenticated: request.isAuthenticated(),
        user: request.user || null
    });
});

app.all('/auth', passport.authenticate('ActiveDirectory', { failWithError: true }),
    (request, response, next) => {
        if (request.method !== 'POST')
            return next(createHttpError(405));
        response.json({ user: request.user });
    });

app.use('/print', (request, _response, next) => next(!request.isAuthenticated() ? createHttpError(401) : undefined), print);

app.use((_request, _response, next) => next(createHttpError(404)));

app.use((error, _request, response, _next) =>
    response.status(error.status || 500).json({
        type: error.name || 'Error',
        message: error.message
    }));

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