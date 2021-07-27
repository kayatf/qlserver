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

com.logicpartners.labelInspector = function (designer, canvas) {
  this.canvas = canvas;
  this.canvasElement = $(canvas);
  this.labelDesigner = designer;
  var self = this;
  this.boundingBox = null;

  this.updatePosition = function (xchange) {
    this.inspectorWindow.css("width",
        parseInt(this.inspectorWindow.css("width")) + xchange);
    this.boundingBox = this.inspectorWindow[0].getBoundingClientRect();
  }

  // Create the property window.
  this.inspectorWindow = $('<div></div>')
  .addClass("designerUtilityToolbar designerUtilityLabelInspector")
  .css({
    "left": this.labelDesigner.toolbar.boundingBox.left,
    "top": this.canvas.getBoundingClientRect().top - 50,
    "width": this.labelDesigner.propertyInspector.boundingBox.right
        - this.labelDesigner.toolbar.boundingBox.left
  })
  //.draggable({handle: "div.designerPropertyTitle"})
  .insertAfter(this.canvasElement);

  this.toolsViewContainer = $('<div></div>')
  .addClass("designerLabelContent")
  .appendTo(this.inspectorWindow);

  /*
  this.titleBar = $('<div>Tools</div>')
      .addClass("designerPropertyTitle")
      .prependTo(this.toolsWindow)
      .on("dblclick", function() {
        self.toolsViewContainer.toggle();
      });
  */

  this.buttonView = $('<div></div>')
  .appendTo(this.toolsViewContainer);

  this.update = function (activeElement) {
  }

  this.addTool = function (controller) {
    console.log(controller.workspace.html());
    this.buttonView.append(controller.workspace);
  }
}