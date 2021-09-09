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
import {zip} from '../util/fileSystemUtil';
import {PassThrough} from 'stream';
import {fromBuffer} from "file-type";

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

router.get('/inventory/:query', async (request: Request, response: Response) => {
  const browser: Browser = await chromium.launch({headless: env.isProduction});
  const context: BrowserContext = await browser.newContext();

  const page: Page = await context.newPage();
  await page.goto('https://inventory.essteyr.com');
  const onNavigation: Promise<any> = page.waitForNavigation();

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

  // Login to inventory
  await onNavigation;
  await page.type('#username', env.SNIPEIT_USER);
  await page.type('#password', env.SNIPEIT_PASSWORD);
  await page.click('body > form > div > div > div > div > div.box-footer > button');

  // Search assets
  await onNavigation;
  await page.goto('https://inventory.essteyr.com/hardware');
  await page.type(
      '#bulkForm > div > div > div.bootstrap-table.bootstrap3 > div.fixed-table-toolbar > div.pull-right.search.input-group > div > input',
      request.params.query
  );

  // Generate labels
  await page.waitForTimeout(1000);
  await page.click('#assetsListingTable > thead > tr > th.bs-checkbox > div.th-inner > label > input[type=checkbox]');
  await page.selectOption('#toolbar > select', {index: 2})
  await page.click('#bulkEdit');

  // Todo fail if no assets found

  await onNavigation;
  await page.waitForTimeout(1000);

  // Export label(s)
  let buffer: Buffer;
  const labels = await page.$$('.label');
  if (labels.length === 1) {
    buffer = await labels[0].screenshot();
  } else {
    // Create zip archive
    const files: Buffer[] = new Array<Buffer>();
    for (const label of labels)
      files.push(await label.screenshot())
    buffer = await zip(files);
  }
  // Send response and clean up
  // Todo fix empty zip file bug
  await browser.close();
  const stream: PassThrough = new PassThrough();
  stream.end(buffer);
  response.set('Content-Disposition', `attachment; filename=${labels.length === 1 ? 'label.png' : 'labels.zip'}`);
  response.set('Content-Type', (await fromBuffer(buffer))?.mime);
  stream.pipe(response);
});

export default router;