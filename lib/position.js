define(['exports', './util'], function(exports, U) {

  exports.move = move;
  exports.project = project;
  exports.isIn = isIn;

  function move(what, where) {
    return what
      .css({ position: 'absolute', 'margin': 0 })
      .css(project(where, what).css());
  }

  function project(obj, onto) {
    if (onto && onto.jquery)
      onto = onto.get(0);
    return offset(obj).subtract(onto.offsetParent);
  }

  function isIn(pt, bx) {
    return offset(pt).isIn(bx);
  }

  
  // ## Offset ##

  exports.offset = offset;
  exports.Offset = Offset;

  function offset(obj) {
    return new Offset(_offset(obj));
  }

  function Offset(pos) {
    this.top = (pos && pos.top) || 0;
    this.left = (pos && pos.left) || 0;
  }

  Offset.prototype.toString = function() {
    return '#<Offset top: ' + this.top + ' left: ' + this.left + '>';
  };

  Offset.prototype.css = function() {
    return { top: this.top, left: this.left };
  };

  Offset.prototype.add = function(obj) {
    var pos = _offset(obj);
    this.top += pos.top;
    this.left += pos.left;
    return this;
  };

  Offset.prototype.subtract = function(obj) {
    var pos = _offset(obj);
    this.top -= pos.top;
    this.left -= pos.left;
    return this;
  };

  Offset.prototype.isIn = function(obj) {
    return box(obj).containsPoint(this);
  };

  function _offset(obj) {
    if (!obj)
      return { top: 0, left: 0 };
    else if (typeof obj.top == 'number')
      return obj;
    else if (typeof obj.pageY == 'number')
      return { top: obj.pageY, left: obj.pageX };
    else if (typeof obj.offset != 'function')
      obj = $(obj);
    return obj.offset();
  };

  
  // ## Box ##

  function box(obj) {
    return new Box(_box(obj));
  }

  function Box(dim) {
    this.top = dim.top || 0;
    this.left = dim.left || 0;
    this.width = dim.width || 0;
    this.height = dim.height || 0;
  }

  Box.prototype.toString = function() {
    return ('#<Box top: ' + this.top + ' left: ' + this.left
      + ' [' + this.width + 'x' + this.height + ']>');
  };

  Box.prototype.findOffset = function(xpos, ypos, relativeTo) {
    var rel = _box(relativeTo || window),
        offset = new Offset(),
        method;

    if (!(method = _findX[xpos]))
      throw new Error('Unrecognized x-position: `' + xpos + '`.');
    offset.left = method(this, rel);

    if (!(method = _findY[ypos]))
      throw new Error('Unrecognized y-position: `' + ypos + '`.');
    offset.top = method(this, rel);

    return offset;
  };

  Box.prototype.containsPoint = function(point) {
    return (
      point.left >= this.left
      && point.left <= (this.left + this.width)
      && point.top >= this.top
      && point.top <= (this.top + this.height)
    );
  };

  function _box(obj) {
    if (!obj)
      return { top: 0, left: 0, width: 0, height: 0 };
    else if (typeof obj.top == 'number')
      return obj;
    else if (typeof obj.box == 'function')
      return obj.box();

    var query = $(obj),
        dim = query.offset() || { top: 0, left: 0 };

    dim.height = query.height();
    dim.width = query.width();

    return dim;
  };

  var _findX = {
    'center':        function(bd, rd) { return rd.left + (rd.width - bd.width) / 2; },
    'left':          function(bd, rd) { return rd.left; },
    'right':         function(bd, rd) { return rd.left + rd.width - bd.width; },
    'outside-left':  function(bd, rd) { return rd.left - bd.width; },
    'outside-right': function(bd, rd) { return rd.left + rd.width; }
  };

  var _findY = {
    'center':       function(bd, rd) { return rd.top + (rd.height - bd.height) / 2; },
    'top':          function(bd, rd) { return rd.top; },
    'bottom':       function(bd, rd) { return rd.top + rd.height - bd.height; },
    'above':        function(bd, rd) { return rd.top - bd.height; },
    'below':        function(bd, rd) { return rd.top + rd.height; }
  };

  // ### jQuery Integration ###

  var $offset = $.fn.offset;

  $.fn.offset = function(where, relativeTo) {
    if (arguments.length == 0 || (typeof where != 'string'))
      return $offset.call(this);

    var parts = U.words(where || 'center'),
        xpos = parts[0],
        ypos = parts[1] || 'center',
        rel = relativeTo;

    return this.each(function() {
      var pos = box(this).findOffset(xpos, ypos, rel || this.offsetParent);
      $(this).css(pos.css());
    });
  };


});