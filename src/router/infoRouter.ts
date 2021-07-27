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

import {Request, Response, Router} from 'express';
import respond from '../util/respond';
import env from '../env';

const router: Router = Router();

const labelDimensionsSplit: Array<string> = env.LABEL_DIMENSIONS.split('x');
const labelHeight: number = Number.parseInt(labelDimensionsSplit[0]);
const labelWidth: number = Number.parseInt(labelDimensionsSplit[1]);

const millimetersToInches = (millimeters: number): number =>
    Math.round(millimeters / 25.4 * 100) / 100;

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

router.get('/labelDimensions', (request: Request, response: Response) =>
    respond(request, response, undefined, labelDimensions));

export default router;