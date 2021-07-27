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
if (!com.logicpartners.designerTools) {
  com.logicpartners.designerTools = {};
}

com.logicpartners.designerTools.text = function () {
  var self = this;
  this.counter = 1;
  this.button = $("<div></div>").addClass(
      "designerToolbarText designerToolbarButton").attr("title", "Text").append(
      $("<div></div>"));
  this.object = function (x, y, width, height) {
    this.name = "Textbox " + self.counter++;
    this.text = this.name;
    this.x = x;
    this.y = y;
    this.fontSize = 36;
    this.fontType = "Arial";
    this.width = 100;
    this.height = 0;

    this.readonly = ["width", "height"];

    this.getFontHeight = function () {
      var textMeasure = $("<div></div>").css({
        "font-size": this.fontSize + "px",
        "font-family": this.fontType,
        "opacity": 0,
      }).text("M").appendTo($("body"));

      var height = textMeasure.outerHeight();
      textMeasure.remove();
      return height;
    }

    this.getZPLData = function () {
      return "";
    }

    this.toZPL = function (labelx, labely, labelwidth, labelheight) {
      return "^FO" + (this.x - labelx) + "," + (this.y - labely) + "^FD"
          + this.text + "^FS";
    }

    this.draw = function (context) {
      context.font = this.fontSize + "px " + this.fontType;
      var oColor = context.fillStyle;
      context.fillStyle = "white";
      this.height = this.getFontHeight();
      var measuredText = context.measureText(this.text);
      this.width = measuredText.width;
      context.globalCompositeOperation = "difference";
      context.fillText(this.text, this.x, this.y + (this.height * 0.75));
      context.globalCompositeOperation = "source-over";
      context.fillStyle = oColor;
      //context.fillRect(this.x, this.y, this.width, this.height);
    }

    this.setWidth = function (width) {
      //this.width = width;
    }

    this.getWidth = function () {
      return this.width;
    }

    this.setHeight = function (height) {
      //height = height;
    }

    this.getHeight = function () {
      return this.height * 0.75;
    }

    this.setHandle = function (coords) {
      this.handle = this.resizeZone(coords);
    }

    this.getHandle = function () {
      return this.handle;
    }

    this.drawActive = function (context) {
      context.dashedStroke(parseInt(this.x + 1), parseInt(this.y + 1),
          parseInt(this.x) + parseInt(this.width) - 1,
          parseInt(this.y) + parseInt(this.height * 0.9) - 1, [2, 2]);
    }

    this.hitTest = function (coords) {
      return (coords.x >= parseInt(this.x) && coords.x <= parseInt(this.x)
          + parseInt(this.width) && coords.y >= parseInt(this.y) && coords.y
          <= parseInt(this.y) + parseInt(this.height) * 0.75);
    }
  }
}