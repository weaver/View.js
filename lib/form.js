define(['exports', './util', './view'], function(exports, U, V) {

  
  // ## Form ##

  exports.Form = Form;

  $.defView('form', Form);
  function Form(el, value) {
    $.View.call(this, el, value);

    var self = this;

    el.submit(function(ev) {
        self.emit('submit', U.stop(ev));
      })
      .change(function(ev) {
        self.emit('change', ev);
      });
  }

  Form.prototype.value = function() {
    return $(this).formData();
  };

  Form.prototype.update = function(data) {
    $(this).formData(data);
    return this;
  };

  Form.prototype.each = function(fn, ctx) {
    U.each(this.inputs(), fn, ctx);
    return this;
  };

  Form.prototype.inputs = function() {
    return U.reduce(form.find(':named'), {}, function(result, el) {
      var key = name(el),
          inputs = result[key];
      result[key] = inputs ? inputs.add(el) : $(el);
    });
  };

  Form.prototype.reset = function() {
    this.el[0].reset();
    return this;
  };

  Form.prototype.submit = function() {
    this.el[0].submit();
    return this;
  };

  
  // ## jQuery Integration ##

  $.expr.filters.named = function(el) {
    return !!name(el);
  };

  $.fn.extend({
    name: function() {
      return name(this[0]);
    },

    findNamed: function(name) {
      return this.find('[name=' + name + '], [data-name=' + name + ']');
    },

    formData: function(data) {
      var form = this;

      if (!arguments.length) {
        return U.reduce(form.find(':named'), {}, function(data, el) {
          var key = name(el);
          if (!(key in data))
            data[key] = V.value(el);
        });
      }
      else {
        U.each(data, function(val, key) {
          form.findNamed(key).val(val);
        });
        return this;
      }
    }
  });

  
  // ## Helpers ##

  function name(el) {
    return el && (el.getAttribute('name') || el.getAttribute('data-name'));
  }

});