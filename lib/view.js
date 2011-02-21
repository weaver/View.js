define(['exports', './util', './events', './hi'],
function(exports, U, E, I) {

  
  // ## View ##

  exports.View = View;

  U.inherits(View, E.EventEmitter);
  function View(el, value) {
    View.super_.call(this);

    if (el !== undefined)
      this.el = el;

    if (value !== undefined) {
      var self = this;
      U.nextTick(function() { self.init(el, value); });
    }

  }

  View.define = function(ctor) {
    return U.inherits(ctor, View);
  };

  View.prototype.init = function(el, value) {
    if (!this.el.is('.initialized'))
      this.update(value).addClass('initialized');
    return this;
  };

  View.prototype.destroy = function() {
    this.emit('destroy');
    this.el.remove();
    return this;
  };

  View.prototype.isActive = function() {
    return this.el.is('.active');
  };

  View.prototype.toggleActive = function() {
    return this.isActive() ? this.deactivate() : this.activate();
  };

  View.prototype.activate = function() {
    if (!this.isActive()) {
      this.emit('activate');
      this.el.addClass('active');
    }
    return this;
  };

  View.prototype.deactivate = function() {
    if (this.isActive()) {
      this.emit('deactivate');
      this.el.removeClass('active');
    }
    return this;
  };

  View.prototype.value = function() {
    return undefined;
  };

  View.prototype.update = function(value) {
    return this;
  };

  View.prototype.$ = function() {
    return this.el;
  };

  U.each(['get', 'empty', 'addClass', 'removeClass', 'toggleClass'],
    function(name) {
      View.prototype[name] = function() {
        var query = this.$();
        query[name].apply(query, arguments);
        return this;
      };
    });

  U.each(['get', 'attr'],
    function(name) {
      View.prototype[name] = function() {
        var query = this.$();
        return query[name].apply(query, arguments);
      };
    });

  
  // ## Registry ##

  function roles(el) {
    var result = U.words(el.getAttribute('role'));

    if (el.id)
      result.unshift('#' + U.removeUniqueSuffix(el.id));

    return result;
  }

  U.inherits(Registry, E.EventEmitter);
  function Registry() {
    E.EventEmitter.call(this);
    this.roles = {};
  }

  Registry.prototype.define = function(name, ctor) {
    this.roles[name] = ctor;
    return this;
  };

  Registry.prototype.find = function(roles) {
    var role, registry = this.roles;
    for (var i = 0, l = roles.length; i < l; i++) {
      if ((role = roles[i]) in registry)
        return role;
    }
  };

  Registry.prototype.init = function(el, data) {
    var attempt = roles(el),
        name = this.find(attempt),
        ctor = name && this.roles[name];

    if (ctor === undefined)
      I.fail('No constructor found in', attempt, 'for', el);

    var obj = ctor($(el), data) || null;
    this.emit(name, obj);
    return obj;
  };

  
  // ## jQuery Integration ##

  var _jQuery = window.jQuery,
      $roles = $._roles = new Registry(),
      $val = $.fn.val;

  window.$ = window.jQuery = _jQuery.extend(function(selector, context) {
    if (selector && selector.$)
      return selector.$(context);
    return _jQuery(selector, context);
  }, _jQuery);

  $.extend({
    View: View,

    view: function(el, value) {
      if (!el)
        return undefined;
      else if (arguments.length == 2)
        return $.data(el, 'view', $roles.init(el, value));
      else
        return $.data(el, 'view');
    },

    defView: function(name, ctor) {
      if (!isTitleCase(fnName(ctor)))
        $roles.define(name, ctor);
      else {
        U.inherits(ctor, View);
        $roles.define(name, function(el, value) {
          return new ctor(el, value);
        });
      }
      return this;
    },

    onView: function(name, callback) {
      $roles.on(name, callback);
      return this;
    }
  });

  $.fn.extend({
    view: function(value) {
      if (arguments.length == 0)
        return $.view(this[0]);
      else
        return $.view(this[0], value);
    },

    eachView: function(fn) {
      var view, idx = 0;
      return this.each(function(_, el) {
        if ((view = $.view(el)))
          fn.call(view, idx++, view, el);
      });
    },

    val: function(val) {
      if (!arguments.length)
        return value(this[0]);

      var inputs = [];

      this.each(function() {
        update(this, val, inputs);
      });

      if (inputs)
        $val.call($(inputs), val);

      return this;
    }
  });

  var manip = {};
  U.each({ appendTo: 'append', 'prependTo': 'prepend' },
    function(method, methodTo) {
      manip[method] = $.fn[method];
      manip[methodTo] = $.fn[methodTo];

      $.fn[method] = function(selector) {
        if (selector && !selector.jquery && selector.$)
          selector = selector.$();
        return manip[method].call(this, selector);
      };

      $.fn[methodTo] = function(selector) {
        if (!selector || !selector[method])
          return manip[methodTo].apply(this, arguments);
        selector[method](this);
        return this;
      };

    });

  
  // ## Value ##

  exports.value = value;
  exports.update = update;

  function value(el) {
    if (!el) return undefined;

    var val = $.view(el) || $.data(el, 'val');

    if ($.isFunction(val))
      return val.call(el);
    else if (val && $.isFunction(val.value))
      return val.value();
    else if ((val = $.data(el, 'tmplItem')))
      return val.data;
    else if (isInput(el))
      return $val.call($(el));
    else
      return val;
  }

  function update(el, val, _inputs) {
    var view = $.view(el) || $.data(el, 'val');

    if ($.isFunction(view))
      view.call(el, val);
    else if (view && $.isFunction(view.update))
      view.update(val);
    else if ((view = $.data(el, 'tmplItem'))) {
      view.data = val;
      view.update();
    }
    else if (isInput(el))
      _inputs ? _inputs.push(el) : $val.call($(el), val);
    else
      $.data(el, 'val', val);
  }

  
  // ## Helpers ##

  function isInput(el) {
    return el.value !== undefined || el.nodeName == 'select';
  }

  function fnName(fn) {
    if (fn.name)
      return fn.name;
    var probe = fn.toString().match(/function(?:\s+([^\(]+)\()/);
    return probe ? probe[1] : '';
  }

  function isTitleCase(name) {
    return /^[A-Z]/.test(name);
  }

});