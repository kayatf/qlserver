/*
 *     ________________ __
 *    / ____/ ___/ ___// /____  __  _______
 *   / __/  \__ \\__ \/ __/ _ \/ / / / ___/
 *  / /___ ___/ /__/ / /_/  __/ /_/ / /
 * /_____//____/____/\__/\___/\__, /_/
 *                           /____/
 *
 * This file is licensed under The MIT License
 * Copyright (c) 2021 Riegler Daniel
 * Copyright (c) 2021 ESS Engineering Software Steyr GmbH
 * Copyright (c) 2017 Thomas E. Eynon
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

import {labelHeight, labelWidth, millimetersToInches} from '../util/mathUtil';
import {Request, Response, Router} from 'express';
import {Browser, BrowserContext, chromium, Page} from 'playwright';
import respond from '../util/respond';
import env from '../env';
import {PassThrough} from 'stream';
import createHttpError from "http-errors";

const router: Router = Router();

const labelDimensions: {} = {
  millimeters: {
    height: labelHeight,
    width: labelWidth
  },
  inches: {
    height: millimetersToInches(labelHeight),
    width: millimetersToInches(labelWidth)
  }
};

router.get('/dimensions', (request: Request, response: Response) =>
    respond(request, response, undefined, labelDimensions));

router.get('/generate/:query', async (request: Request, response: Response) => {
  const browser: Browser = await chromium.launch({headless: env.isProduction});
  const context: BrowserContext = await browser.newContext();

  const page: Page = await context.newPage();
  await page.goto(env.SNIPEIT_URL);
  const onNavigation: Promise<any> = page.waitForNavigation();

  if (env.USE_APP_PROXY) {
    // Fill in username form
    await onNavigation;
    await page.waitForSelector('[name="loginfmt"]');
    await page.type('[name="loginfmt"]', env.APP_PROXY_USER);
    await page.click('[type="submit"]');

    // Fill in password form
    await onNavigation;
    await page.waitForSelector('input[type="password"]');
    await page.type('input[type="password"]', env.APP_PROXY_PASSWORD);
    await page.click('input[type="submit"]');
  }

  // Login to inventory
  await onNavigation;
  await page.type('#username', env.SNIPEIT_USER);
  await page.type('#password', env.SNIPEIT_PASSWORD);
  await page.click('body > form > div > div > div > div > div.box-footer > button');

  // Search asset
  await onNavigation;
  await page.type('#tagSearch', request.params.query);
  await page.click('body > div.wrapper > header > nav > div.navbar-custom-menu > ul > li:nth-child(6) > form > div > div.col-xs-1 > button');

  // Generate label
  await onNavigation;
  // Check if asset could be found
  // Todo fix bug
  try {
    await page.waitForSelector('#bulkEdit', {timeout: 1000});
  } catch (_error) {
    console.error('Error!');
    await browser.close();
    respond(request, response, createHttpError(404, 'Could not find asset.'));
    return;
  }
  await page.click('#bulkEdit');

  // Send response
  await onNavigation;
  await page.waitForSelector('.label');
  const stream: PassThrough = new PassThrough();
  stream.end(await (await page.$$('.label'))[0].screenshot());
  response.set('Content-Disposition', `attachment; filename=${request.params.query.toUpperCase()}.png`);
  response.set('Content-Type', 'image/png');
  stream.pipe(response);

  // Close browser
  await browser.close();
});

export default router;