define(['exports', './util', './hi', './view'],
function(exports, Util, Hi, View) {
  $.extend(exports, Hi);
  exports.inherits = Util.inherits;
  exports.View = View.View;
});