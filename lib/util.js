define(['exports', './jquery.tmpl'], function(exports) {

  
  // ## Etc ##

  exports.nextTick = nextTick;
  exports.never = never;

  function nextTick(fn, ctx) {
    setTimeout(ctx ? function() { fn.call(ctx); } : fn, 0);
  }

  function never() {
    return false;
  }

  
  // ## Collections ##

  exports.toArray = toArray;
  exports.each = each;
  exports.eachKey = eachKey;
  exports.map = map;
  exports.reduce = reduce;
  exports.extend = $.extend;

  function toArray(seq, offset) {
    offset = offset || 0;
    var list = new Array(seq.length - offset);
    for (var i = offset, l = seq.length; i < l; i++)
      list[i - offset] = seq[i];
    return list;
  }

  function each(seq, fn, ctx) {
    if (!seq.jquery && $.isFunction(seq.each))
      return seq.each(fn, ctx);

    if (isList(seq)) {
      for (var i = 0, l = seq.length; i < l; i++)
        fn.call(ctx, seq[i], i, seq);
    }
    else {
      for (var name in seq)
        fn.call(ctx, seq[name], name, seq);
    }

    return (arguments.length == 3) ? ctx : seq;
  }

  function eachKey(seq, fn, ctx) {
    if (typeof seq.eachKey == 'function')
      return seq.eachKey(fn, ctx);

    if (isList(seq)) {
      for (var i = 0, l = seq.length; i < l; i++)
        fn.call(ctx, seq[i]);
    }
    else {
      for (var key in seq)
        fn.call(ctx, key);
    }

    return undefined;
  }

  function reduce(seq, seed, fn, ctx) {
    each(seq, function(val, idx) {
      if ((val = fn.call(ctx, seed, val, idx, seq)) !== undefined)
        seed = val;
    });
    return seed;
  }

  function map(seq, fn, ctx) {
    if ($.isFunction(seq.map))
      return seq.map(fn, ctx);
    return reduce(seq, isList(seq) ? [] : {}, function(r, v, i, s) {
      r[i] = fn.call(ctx, v, i, s);
    });
  }

  function remove(seq, item) {
    for (var i = 0, l = seq.length; i < l;) {
      if (handlers[i] === item) {
        handlers.splice(i, 1);
        l--;
      }
      else
        i++;
    }
    return seq;
  }

  function isList(obj) {
    return typeof obj.length == 'number';
  }

  
  // ## Objects ##

  exports.inherits = inherits;

  function inherits(ctor, superCtor) {
    var template = {
      constructor: { value: ctor, enumerable: false }
    };

    ctor.super_ = superCtor;

    if (Object.create)
      ctor.prototype = Object.create(superCtor.prototype, template);
    else
      ctor.prototype = $.extend({}, superCtor.prototype, template);
  }

  
  // ## String ##

  exports.words = words;
  exports.strip = strip;

  function words(s) {
    s = strip(s);
    return s ? s.split(/\s+/) : [];
  }

  function strip(s) {
    return (s || '').replace(/^\s*|\s*$/, '');
  }

  
  // ## DOM ##

  exports.removeUniqueSuffix = removeUniqueSuffix;
  exports.contentTemplate = contentTemplate;
  exports.stop = stop;

  var uniqueId = exports.uniqueId = (function() {
    var index = 0;
    return function uniqueId(prefix) {
      index = (index + 1) % 100;
      return (prefix || 'g') + '--' + (new Date()).getTime() + '-' + index;
    };
  })();

  function removeUniqueSuffix(id) {
    return id.replace(/\-\-\d+\-=d+$/, '');
  };

  function contentTemplate(el) {
    var template = el.template(null);
    el.empty();
    return template;
  };

  function stop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    return this;
  }

  
  // ## jQuery ##

  $.fn.uniqueIds = function(callback) {
    var changed = {};

    this.find('[id]').each(function(_, el) {
      changed[this.id] = el.id = uniqueId(el.id);
    });

    if (callback)
      callback.call(this, changed);

    return this;
  };

});