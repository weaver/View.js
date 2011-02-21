define(['exports', './util'], function(exports, U) {

  exports.computeStyle = computeStyle;
  exports.captureStyle = captureStyle;
  exports.transferStyle = transferStyle;
  exports.diffStyle = diffStyle;
  exports.revertable = revertable;

  function computeStyle(el) {
    if (!el)
      return {};
    if (window.getComputedStyle)
      return window.getComputedStyle(el, null);
    else
      return el.currentStyle || {};
  }

  function captureStyle(q, names) {
    var result = {};
    q.eachStyle(names, function(name, value) {
      result[name] = value;
    });
    return result;
  }

  function transferStyle(from, into) {
    return into.each(function(index) {
      var self = $(this);

      $.eachStyle(from[index], function(name, value) {
        self.css(name, value);
      });

      if (from[index].nodeType == 1)
        transferStyle(from[index].childNodes, self.children());
    });
  }

  function diffStyle(orig, el) {
    var result = {};

    $.eachStyle(el, function(name, value) {
      if (orig[name] != value)
        result[name] = [orig[name], value];
    });

    return result;
  }

  function revertable(diff, el) {
    var properties = {};

    $.each(diff, function(name, values) {
      if ($.css(el, name) == values[1])
        properties[name] = values[0];
    });

    return properties;
  }

  // ## jQuery Integration ##

  $.fn.highlight = function(className, diff) {
    var self, style;
    return this.each(function() {
      if (!(self = $(this)).is('.' + className)) {
        style = diff && self.style();
        self.addClass(className).data('highlight', {
          cls: className,
          diff: diff && diffStyle(style, this)
        });
      }
    });
  };

  $.fn.fadeBack = function(duration, easing) {
    return this.each(function() {
      var self = $(this),
          state = self.data('highlight'),
          properties = revertable(state.diff, this);

      self.animate(properties, duration, easing, function() {
        self.removeClass(state.cls).style(properties, '');
      });
    });
  };

  $.fn.snapshot = function(events) {
    return transferStyle(this, this.clone(events));
  };

  $.fn.style = function(name, value) {
    if (arguments.length == 0)
      return captureStyle(this);
    else if (arguments.length == 1)
      switch ($.type(name)) {
      case 'array':
        return captureStyle(this, name);
      default:
        return this.css(name);
      }
    else
      switch ($.type(name)) {
      case 'array':
      case 'object':
        var props = {};
        U.eachKey(name, function(name) { props[name] = value; });
        return this.css(props);
      default:
        return this.css(name, value);
      }
  };

  $.fn.eachStyle = function(names, fn) {
    $.eachStyle(this[0], names, fn);
    return this;
  };

  $.eachStyle = function(el, names, fn) {
    var name, val, styles = computeStyle(el);

    if (fn === undefined) {
      fn = names;
      names = styles;
    }
    else if (names === undefined)
      names = styles;

    if (styles) {
      if (names.length !== undefined)
        // W3C
        for (var i = 0, l = names.length; i < l; i++) {
          name = $.camelCase(names[i]);
          name = $.cssProps[name] || name;
          fn(name, $.css(el, name));
        }
      else
        // IE
        for (name in styles) {
          // $.css() chokes on "borderWidth: 0px 0px 1px" for some reason.
          try      { val = $.css(el, name); }
          catch(_) { val = styles[name]; }
          fn(name, val);
        }
    }

    return el;
  };
});