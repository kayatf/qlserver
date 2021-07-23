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

let canvasDesigner;
$(document).ready(() => $.ajax({
  type: 'GET',
  dataType: 'json',
  url: '/info/labelDimensions',
  error: (jqXHR, textStatus, errorThrown) => {
    if (confirm(`Error: ${errorThrown}`)) {
      window.location.reload();
    }
  },
  success: data => {
    console.log(JSON.stringify(data));
    /* const width = $.parseJSON(data).data.inches.width;
     const height = $.parseJSON(data).data.inches.height;
     canvasDesigner = new com.logicpartners.labelDesigner('labelDesigner',
         width, height);
     canvasDesigner.labelInspector.addTool(
         new com.logicpartners.labelControl.size(canvasDesigner));
     canvasDesigner.labelInspector.addTool(
         new com.logicpartners.labelControl.print(canvasDesigner));
     canvasDesigner.toolbar.addTool(
         new com.logicpartners.designerTools.text());
     canvasDesigner.toolbar.addTool(
         new com.logicpartners.designerTools.image());*/
  }
}));