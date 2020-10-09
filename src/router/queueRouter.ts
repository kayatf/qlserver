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

import {NextFunction, Request, Response, Router} from 'express';
import rawBodyParser from '../util/rawBodyParser';
import {FileTypeResult} from 'file-type/core';
import {fromBuffer} from 'file-type';
import createHttpError from 'http-errors';
import {unzip} from '../util/fileSystemUtil';
import {printQueue} from '../util/printerUtil';
import respond from '../util/respond';

const router: Router = Router();

router.get('/', (request: Request, response: Response) =>
  respond(request, response, undefined, {itemsInQueue: printQueue.length})
);

router.delete('/', (request: Request, response: Response) => {
  const length: number = printQueue.length;
  printQueue.splice(0, length);
  respond(request, response, undefined, {
    removedItems: length,
    itemsInQueue: printQueue.length,
  });
});

router.post(
  '/',
  rawBodyParser(),
  async (request: Request, response: Response, next: NextFunction) => {
    const type: FileTypeResult | undefined = await fromBuffer(request.body);
    if (!type)
      return next(createHttpError(400, 'Missing request body (binary).'));
    const items: Buffer[] = [];
    if ('application/zip' === type.mime) {
      const zipEntries: Buffer[] = await unzip(request.body, 'image/png');
      items.push(...zipEntries);
      if (0 === zipEntries.length)
        return next(
          createHttpError(
            400,
            'Could not extract image files from zip archive.'
          )
        );
    } else if ('image/png' === type.mime) items.push(request.body);
    else return next(createHttpError(400, 'Unsupported file format.'));
    printQueue.push(...items);
    respond(request, response, undefined, {
      addedItems: items.length,
      positionInQueue: 1 + printQueue.length - items.length,
      itemsInQueue: printQueue.length,
    });
  }
);

router.all('/', (request: Request, response: Response, next: NextFunction) =>
  next(createHttpError(405))
);

export default router;
