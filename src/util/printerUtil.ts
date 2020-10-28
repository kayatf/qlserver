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

import {remove} from './fileSystemUtil';
import {platform, stdout} from 'process';
import tempWrite from 'temp-write';
import {exec} from 'child_process';
import {lookpath} from 'lookpath';
import {PathLike} from 'fs';
import sharp from 'sharp';
import env from '../env';

// reference: https://pypi.org/project/brother-ql/
/* eslint-disable */
const LABELS: any = {
  '17x54': [165, 566],
  '17x87': [165, 956],
  '23x23': [202, 202],
  '29x42': [306, 425],
  '29x90': [306, 991],
  '39x90': [314, 991],
  '52x29': [578, 271],
  '62x29': [696, 271],
  '62x100': [696, 1109],
  '102x51': [1164, 526],
  '102x152': [1164, 1660],
};
/* eslint-enable */

const discoverBrotherInterface = (): Promise<string> =>
  new Promise<string>((resolve, reject) =>
    lookpath('brother_ql').then(path => {
      if (!path)
        return reject(
          new Error('Could not find brother_ql executable in PATH.')
        );
      resolve(path);
    })
  );

const executeCommand = (command: string): Promise<string> =>
  new Promise((resolve, reject) =>
    exec(
      command,
      {
        env: {
          PYTHONIOENCODING: 'UTF-8',
          BROTHER_QL_BACKEND: 'linux' === platform ? 'linux_kernel' : 'pyusb',
          BROTHER_QL_MODEL: env.PRINTER,
        },
      },
      (error, stdout: string) => {
        if (error) reject(error);
        else resolve(stdout);
      }
    )
  );

const discoverPrinter = (brotherInterface: string): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    executeCommand(`${brotherInterface} discover`)
      .then(stdout => {
        let address: string = stdout.split(/\r?\n/).reverse()[1];
        if (address.includes('_')) address = address.split('_')[0];
        if (address.startsWith('usb://')) resolve(address);
        else reject(new Error('Could not find attached printer.'));
      })
      .catch(reject);
  });

export const printQueue = new Array<Buffer>();
export const startQueue = async (): Promise<void> => {
  // discover brother_ql cli
  const brotherInterface: string = await discoverBrotherInterface();
  stdout.write(
    `Using ${await executeCommand(`${brotherInterface} --version`)}`
  );
  // run queue
  let printing = false;
  setInterval(async () => {
    // halt if already printing or queue is empty
    if (printing || printQueue.length === 0) return;
    try {
      const printer: string = await discoverPrinter(brotherInterface);
      printing = true;
      // resize image(s)
      const image: PathLike = await tempWrite(
        await sharp(printQueue.pop())
          .resize({
            fit: 'fill',
            height: LABELS[env.LABEL_DIMENSIONS][0],
            width: LABELS[env.LABEL_DIMENSIONS][1],
          })
          .toBuffer()
      );
      // send the instruction to the printer
      await executeCommand(
        `${brotherInterface} --printer ${printer} print --label ${env.LABEL_DIMENSIONS} ${image}`
      );
      // cleanup
      await remove(image);
      printing = false;
    } catch (error) {
      printing = false;
      if (env.isDevelopment) console.warn(error);
    }
  }, 1000);
};
