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

import basicAuth, {AsyncAuthorizerCallback} from 'express-basic-auth';
import ActiveDirectory from 'activedirectory2';
import {RequestHandler} from 'express';
import env from '../env';

export default class ActiveDirectoryAuthenticator {
  private readonly activeDirectory: ActiveDirectory;

  private readonly basicAuth: RequestHandler;

  public constructor(ldapUrl: string, ldapBaseDn: string, ldapBindDn: string, ldapBindCredential: string) {
    // connect to activate directory
    this.activeDirectory = new ActiveDirectory({
      url: ldapUrl,
      baseDN: ldapBaseDn,
      username: ldapBindDn,
      password: ldapBindCredential
    });
    // initialize express basic auth
    this.basicAuth = basicAuth({
      challenge: true,
      authorizeAsync: true,
      authorizer: (username: string, password: string, callback: AsyncAuthorizerCallback) => {
        // bypass login in development environment
        if (!env.isProduction)
          callback(undefined, true);
        else this.activeDirectory.authenticate(username, password,
            (error: string, authed: boolean) => callback(undefined, error ? false : authed))
      }
    });
  }

  public getBasicAuth(): RequestHandler {
    return this.basicAuth;
  }
}