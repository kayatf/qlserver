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

import {existsSync, PathLike, readFile, unlink, writeFile} from 'fs';
import {FileTypeResult, fromBuffer} from 'file-type';
import AdmZip, {IZipEntry} from 'adm-zip';
import {join} from 'path';
import {MimeType} from 'file-type/core';
import getAppDataPath from 'appdata-path';

const appDataPath = getAppDataPath('.qlserver');

const formatPath = (path: PathLike) => join(appDataPath, path.toString());

// export const createAppDataEntry = (): Promise<void> =>
//   new Promise<void>((resolve, reject) =>
//     exists(appDataPath).then(exists => {
//       if (exists) resolve();
//       else
//         mkdir(appDataPath, error => {
//           if (error) reject(error);
//           else resolve();
//         });
//     })
//   );

export const unzip = (
  zipFile: Buffer,
  ...fileTypes: MimeType[]
): Promise<Buffer[]> =>
  new Promise<Buffer[]>(resolve => {
    const files = new Array<Buffer>();
    const entries: IZipEntry[] = new AdmZip(zipFile).getEntries();
    entries.forEach((entry: IZipEntry, index: number) =>
      entry.getDataAsync(async buffer => {
        const type: FileTypeResult | undefined = await fromBuffer(buffer);
        if (type && fileTypes.includes(type.mime)) files.push(buffer);
        if (entries.length - 1 === index) resolve(files);
      })
    );
  });

// todo check asynchronously
export const exists = (path: PathLike): Promise<boolean> =>
  new Promise(resolve => resolve(existsSync(formatPath(path))));

export const write = (path: PathLike, data: string): Promise<string> =>
  new Promise((resolve, reject) => {
    writeFile(formatPath(path), data, error => {
      if (error) reject(error);
      else resolve(data);
    });
  });

export const remove = (path: PathLike): Promise<void> =>
  new Promise<void>(resolve => {
    unlink(path, error => {
      if (error) console.warn(error);
      resolve();
    });
  });

export const read = (path: PathLike): Promise<string> =>
  new Promise((resolve, reject) =>
    readFile(formatPath(path), {encoding: 'utf-8'}, (error, data) => {
      if (error) reject(error);
      else resolve(data);
    })
  );
