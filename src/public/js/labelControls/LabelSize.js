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