"use strict";
/*
 *     ________________ __
 *    / ____/ ___/ ___// /____  __  _______
 *   / __/  \__ \\__ \/ __/ _ \/ / / / ___/
 *  / /___ ___/ /__/ / /_/  __/ /_/ / /
 * /_____//____/____/\__/\___/\__, /_/
 *                           /____/
 *
 * This file is licensed under The MIT License
 * Copyright (c) 2020 Riegler Daniel
 * Copyright (c) 2020 ESS Engineering Software Steyr GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticator_1 = require("./auth/authenticator");
const http_graceful_shutdown_1 = __importDefault(require("http-graceful-shutdown"));
const expressUtil_1 = require("./util/expressUtil");
const sessionMiddleware_1 = __importDefault(require("./auth/sessionMiddleware"));
const printerUtil_1 = require("./util/printerUtil");
const fileSystemUtil_1 = require("./util/fileSystemUtil");
const http_errors_1 = __importDefault(require("http-errors"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = require("body-parser");
const marked_1 = __importDefault(require("marked"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const https_1 = __importDefault(require("https"));
const cors_1 = __importDefault(require("cors"));
const env_1 = __importDefault(require("./env"));
const rawBodyParser_1 = __importDefault(require("./util/rawBodyParser"));
const file_type_1 = require("file-type");
// allow self signed/invalid SSL certifications when not in production
if (env_1.default.isDevelopment)
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
(async () => {
    console.log(await fileSystemUtil_1.read('./console_header.txt'));
    if (!env_1.default.isProduction)
        console.warn('Running not in production mode!');
    const app = express_1.default();
    // middleware
    app.use(morgan_1.default(env_1.default.isProduction ? 'tiny' : 'dev'));
    app.use(helmet_1.default());
    app.use(body_parser_1.json());
    app.use(await sessionMiddleware_1.default());
    app.use(cors_1.default({
        origin: true,
        credentials: true,
        exposedHeaders: ['set-cookie'],
    }));
    // initialize AD authorization
    authenticator_1.initAuthenticator(app);
    // readme page
    const readme = marked_1.default(await fileSystemUtil_1.read('./README.md'));
    app.all('/', expressUtil_1.method('GET'), (request, response) => response.send(readme));
    // authentication
    app.all('/auth', expressUtil_1.method('POST'), authenticator_1.authenticate(), (request, response) => expressUtil_1.respond(request, response, undefined, { user: request.user }));
    // session status
    app.all('/status', expressUtil_1.method('GET'), (request, response) => expressUtil_1.respond(request, response, null, {
        isAuthenticated: request.isAuthenticated(),
        user: request.user || null,
    }));
    // add items to print queue
    app.all('/print/label', expressUtil_1.method('POST'), authenticator_1.requireAuthentication(), rawBodyParser_1.default(), async (request, response, next) => {
        const type = await file_type_1.fromBuffer(request.body);
        if (!type) {
            console.log(1);
            return next(http_errors_1.default(400, 'Missing request body (binary).'));
        }
        switch (type.mime) {
            case 'application/zip':
                const items = await fileSystemUtil_1.unzip(request.body, 'image/png');
                printerUtil_1.printQueue.push(...items);
                expressUtil_1.respond(request, response, undefined, {
                    addedItems: items.length,
                    positionInQueue: printerUtil_1.printQueue.length - items.length + 1,
                });
                break;
            case 'image/png':
                printerUtil_1.printQueue.push(request.body);
                expressUtil_1.respond(request, response, undefined, {
                    addedItems: 1,
                    positionInQueue: printerUtil_1.printQueue.length + 1,
                });
                break;
            default:
                return next(http_errors_1.default(400, 'Unsupported file type.'));
        }
    });
    // handle 404
    app.use((request, response, next) => next(http_errors_1.default(404)));
    // error handler
    app.use((error, request, response, _next) => expressUtil_1.respond(request, response, error));
    // start printing queue
    await printerUtil_1.startQueue();
    // webserver setup
    const server = env_1.default.ENCRYPT
        ? https_1.default
            .createServer({
            cert: await fileSystemUtil_1.read(env_1.default.CERTIFICATE),
            key: await fileSystemUtil_1.read(env_1.default.PRIVATE_KEY),
        }, app)
            .listen(env_1.default.PORT, env_1.default.HOST)
        : http_1.default.createServer(app).listen(env_1.default.PORT, env_1.default.HOST);
    server.once('listening', () => {
        http_graceful_shutdown_1.default(server, {
            signals: 'SIGINT SIGTERM',
            timeout: 1000 * 10,
            development: env_1.default.isDevelopment,
            finally: () => console.log('Shut down webserver.'),
        });
        console.log(`Listening on ${env_1.default.ENCRYPT ? 'https' : 'http'}://${env_1.default.HOST}:${env_1.default.PORT}`);
    });
})();
//# sourceMappingURL=index.js.map