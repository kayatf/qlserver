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

if (!com) {
  var com = {};
}
if (!com.logicpartners) {
  com.logicpartners = {};
}
if (!com.logicpartners.labelControl) {
  com.logicpartners.labelControl = {};
}

com.logicpartners.labelControl.size = function (designer) {
  let self = this;
  this.designer = designer;
  this.workspace = $("<div></div>").addClass("designerLabelControl").attr(
      "title", "Label Size");

  this.dpiContainer = $("<div>DPI: </div>").addClass(
      "designerLabelControlContainer").appendTo(this.workspace);
  this.dpiController = $("<input type=\"text\" />")
  .addClass("designerLabelControlElement")
  .css({
    width: "50px"
  })
  .val(this.designer.dpi)
  .appendTo(this.dpiContainer)
  .on("blur", () => self.updateDesigner())
  .on("keypress", e => {
    if (e.which === 13) {
      e.preventDefault();
      self.updateDesigner();
    }
  });

  this.widthContainer = $("<div>Width: </div>").addClass(
      "designerLabelControlContainer").appendTo(this.workspace);
  this.widthController = $("<input type=\"text\" />").attr("disabled",
      "disabled")
  .addClass("designerLabelControlElement")
  .css({
    width: "50px"

  })
  .val(this.designer.labelWidth / this.designer.dpi)
  .appendTo(this.widthContainer)
  .on("blur", () => self.updateDesigner())
  .on("keypress", e => {
    if (e.which === 13) {
      e.preventDefault();
      self.updateDesigner();
    }
  });

  this.heightContainer = $("<div>Height: </div>").addClass(
      "designerLabelControlContainer").appendTo(this.workspace);
  this.heightController = $("<input type=\"text\" />").attr("disabled",
      "disabled")
  .addClass("designerLabelControlElement")
  .css({
    width: "50px"

  })
  .val(this.designer.labelHeight / this.designer.dpi)
  .appendTo(this.heightContainer)
  .on("blur", () => self.updateDesigner())
  .on("keypress", e => {
    if (e.which === 13) {
      e.preventDefault();
      self.updateDesigner();
    }
  });

  this.updateDesigner = function () {
    let dpi = this.designer.dpi;

    if (!isNaN(this.dpiController.val())) {
      dpi = this.dpiController.val();
    }
    this.designer.dpi = dpi;

    let width = this.designer.labelWidth / this.designer.dpi;
    let height = this.designer.labelHeight / this.designer.dpi;

    if (!isNaN(this.widthController.val())) {
      width = this.widthController.val();
    }
    if (!isNaN(
        this.heightController.val())) {
      height = this.heightController.val();
    }

    this.designer.updateLabelSize(width, height);
    this.widthController.val(width);
    this.heightController.val(height);
  }

  this.update = function () {
    this.widthController.val(this.designer.labelWidth / this.designer.dpi);
    this.heightController.val(this.designer.labelHeight / this.designer.dpi);
  }
}