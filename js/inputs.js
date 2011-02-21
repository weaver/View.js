define(['./hi/index', './hi/form', './hi/inputs'],
function (Hi, Form, Inputs) {

  $(function() {
    $('[role=boolcheck]').view(undefined);
    var select = $('[role=select]').view(undefined);
    //setTimeout(function() { select.open(); }, 0);

    $('form :named')
      .change(function() {
        $('#value').text(JSON.stringify($('form').formData()));
      })
      .change();
  });

});