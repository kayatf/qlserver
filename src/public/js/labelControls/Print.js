if (!com) {
  var com = {};
}
if (!com.logicpartners) {
  com.logicpartners = {};
}
if (!com.logicpartners.labelControl) {
  com.logicpartners.labelControl = {};
}

com.logicpartners.labelControl.print = function (designer) {
  let self = this;
  this.designer = designer;
  this.workspace = $("<div></div>").addClass("designerLabelControl").attr(
      "title", "Label Size").css({float: "right"});

  this.buttonContainer = $("<div></div>").appendTo(this.workspace);
  this.button = $("<button>Print</button>").css(
      {"line-height": "30px"}).appendTo(this.buttonContainer)
  .on("click", () => {
    canvasDesigner.setActiveElement();
    document.getElementById("labelDesigner").toBlob(blob => $.ajax({
      url: '/queue',
      type: 'POST',
      data: blob,
      processData: false,
      contentType: false,
      headers: {
        'accept': 'application/json',
      },
      success: result => alert(
          `Added label to print queue on position #${result.data.positionInQueue}.`
      ),
      error: (jqXHR, textStatus, errorThrown) => {
        alert(`${textStatus}: ${errorThrown}`);
        window.location.reload();
      }
    }), 'image/png')
  })

  this.update = function () {
    this.widthController.val(this.designer.labelWidth / this.designer.dpi);
    this.heightController.val(this.designer.labelHeight / this.designer.dpi);
  }
}