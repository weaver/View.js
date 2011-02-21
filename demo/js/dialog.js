define(['./hi/index', './hi/dialog'],
function(Hi, Dialog) {

  $(function() {
    var modal = Dialog.modal('#demo')
      .addClass('textbox')
      .appendTo('body')
      .on('clickout', function() {
        this.deactivate();
      });

    $('#toggle').click(function() {
      modal.toggleActive();
    });
  });

});