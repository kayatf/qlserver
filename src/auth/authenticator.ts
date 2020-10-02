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

import {
  Express,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import env from '../env';
import passport from 'passport';
import LdapStrategy from 'passport-ldapauth';
import createHttpError from 'http-errors';

export const initAuthenticator = (app: Express): void => {
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LdapStrategy(
      {
        server: {
          url: env.LDAP_URL,
          bindDN: env.LDAP_BIND_DN,
          bindCredentials: env.LDAP_BIND_CREDENTIAL,
          searchBase: env.LDAP_SEARCH_BASE,
          searchFilter: env.LDAP_SEARCH_FILTER,
          searchAttributes: env.LDAP_SEARCH_ATTRIBUTES.split(','),
        },
      },
      (user: unknown, done: (error: unknown, user: unknown) => void) =>
        done(null, user)
    )
  );
};

export const authenticate = (): RequestHandler =>
  passport.authenticate('ldapauth', {failWithError: true});

export const requireAuthentication = (): RequestHandler => (
  request: Request,
  _response: Response,
  next: NextFunction
) =>
  next(
    env.isDevelopment || request.isAuthenticated
      ? undefined
      : createHttpError(401)
  );
