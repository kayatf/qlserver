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

import express, {Express, NextFunction, Request, Response} from 'express';
import {
  authenticate,
  initAuthenticator,
  requireAuthentication,
} from './auth/authenticator';
import gracefulShutdown from 'http-graceful-shutdown';
import {method, respond} from './util/expressUtil';
import initSession from './auth/sessionMiddleware';
import {printQueue, startQueue} from './util/printerUtil';
import {read, unzip} from './util/fileSystemUtil';
import createHttpError from 'http-errors';
import http, {Server} from 'http';
import {json} from 'body-parser';
import marked from 'marked';
import morgan from 'morgan';
import helmet from 'helmet';
import https from 'https';
import cors from 'cors';
import env from './env';
import rawBodyParser from './util/rawBodyParser';
import {fromBuffer} from 'file-type';
import {FileTypeResult} from 'file-type/core';

// allow self signed/invalid SSL certifications when not in production
if (env.isDevelopment) process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

(async () => {
  console.log(await read('./console_header.txt'));
  if (!env.isProduction) console.warn('Running not in production mode!');

  const app: Express = express();

  // middleware
  app.use(morgan(env.isProduction ? 'tiny' : 'dev'));
  app.use(helmet());
  app.use(json());
  app.use(await initSession());
  app.use(
    cors({
      origin: true,
      credentials: true,
      exposedHeaders: ['set-cookie'],
    })
  );

  // initialize AD authorization
  initAuthenticator(app);

  // readme page
  const readme: string = marked(await read('./README.md'));
  app.all('/', method('GET'), (request: Request, response: Response) =>
    response.send(readme)
  );

  // authentication
  app.all(
    '/auth',
    method('POST'),
    authenticate(),
    (request: Request, response: Response) =>
      respond(request, response, undefined, {user: request.user})
  );

  // session status
  app.all('/status', method('GET'), (request: Request, response: Response) =>
    respond(request, response, null, {
      isAuthenticated: request.isAuthenticated(),
      user: request.user || null,
    })
  );

  // add items to print queue
  app.all(
    '/print/label',
    method('POST'),
    requireAuthentication(),
    rawBodyParser(),
    async (request: Request, response: Response, next: NextFunction) => {
      const type: FileTypeResult | undefined = await fromBuffer(request.body);
      if (!type) {
        console.log(1);
        return next(createHttpError(400, 'Missing request body (binary).'));
      }
      switch (type.mime) {
        case 'application/zip':
          const items: Buffer[] = await unzip(request.body, 'image/png');
          printQueue.push(...items);
          respond(request, response, undefined, {
            addedItems: items.length,
            positionInQueue: printQueue.length - items.length + 1,
          });
          break;
        case 'image/png':
          printQueue.push(request.body);
          respond(request, response, undefined, {
            addedItems: 1,
            positionInQueue: printQueue.length + 1,
          });
          break;
        default:
          return next(createHttpError(400, 'Unsupported file type.'));
      }
    }
  );

  // handle 404
  app.use((request: Request, response: Response, next: NextFunction) =>
    next(createHttpError(404))
  );

  // error handler
  app.use(
    (error: Error, request: Request, response: Response, _next: NextFunction) =>
      respond(request, response, error)
  );

  // start printing queue
  await startQueue();

  // webserver setup
  const server: Server = env.ENCRYPT
    ? https
        .createServer(
          {
            cert: await read(env.CERTIFICATE),
            key: await read(env.PRIVATE_KEY),
          },
          app
        )
        .listen(env.PORT, env.HOST)
    : http.createServer(app).listen(env.PORT, env.HOST);

  server.once('listening', () => {
    gracefulShutdown(server, {
      signals: 'SIGINT SIGTERM',
      timeout: 1000 * 10,
      development: env.isDevelopment,
      finally: () => console.log('Shut down webserver.'),
    });
    console.log(
      `Listening on ${env.ENCRYPT ? 'https' : 'http'}://${env.HOST}:${env.PORT}`
    );
  });
})();
