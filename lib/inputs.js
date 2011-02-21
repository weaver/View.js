define(['exports', './util', './dialog', './keyboard'],
function(exports, U, D, Kb) {

  
  // ## Checkbox ##

  exports.BooleanCheckbox = BooleanCheckbox;

  $.defView('boolcheck', BooleanCheckbox);
  function BooleanCheckbox(el, value) {
    $.View.call(this, el);

    var self = this;

    this.proxy = $('<input type="checkbox" class="proxy" />')
      .attr({ value: 'on', 'aria-hidden': 'true' })
      .focus(function(e)  { return self.onFocus(e); })
      .blur(function(e)   { return self.onBlur(e); })
      .change(function(e) { return self.onChange(e); })
      .appendTo(el);

    bindRelated(el, function() {
      self.change(!self.value());
    });

    if (value === undefined)
      value = el.attr('aria-checked') == 'true';

    this.init(el, !!value);
  }

  BooleanCheckbox.prototype.isChecked = function() {
    return this.proxy.is(':checked');
  };

  BooleanCheckbox.prototype.value = function() {
    return this.isChecked();
  };

  BooleanCheckbox.prototype.update = function(value) {
    this.proxy.attr('checked', value ? 'checked' : '');
    return this.draw();
  };

  BooleanCheckbox.prototype.change = function(value) {
    if (this.value() != this.update(value).value()) {
      this.el.trigger('change');
      this.emit('change');
    }
    return this;
  };

  BooleanCheckbox.prototype.draw = function() {
    this.attr('aria-checked', this.isChecked() ? 'true' : 'false');
    return this;
  };

  BooleanCheckbox.prototype.onFocus = function(ev) {
    this.el.addClass('focus');
  };

  BooleanCheckbox.prototype.onBlur = function(ev) {
    this.el.removeClass('focus');
  };

  BooleanCheckbox.prototype.onChange = function(ev) {
    this.emit('change');
    this.draw();
  };

  
  // ## Select ##

  $.defView('select', Select);
  function Select(el, value) {
    $.View.call(this, el);

    var self = this;

    el.click(function(e) { return self.onClick(e); })
      .mouseenter(function(e) { self.onMouseEnter(e); })
      .mouseleave(function(e) { self.onMouseLeave(e); });

    this.options = new Options(this)
      .on('activate', function() { self.addClass('open'); })
      .on('deactivate', function() { self.removeClass('open'); });

    this.keyboard = new Kb.Keyboard({
      Spacebar: function(ev) { U.stop(ev); self.open(); },
      Left:     function(ev) { U.stop(ev); self.options.moveLeft(); },
      Up:       function(ev) { U.stop(ev); self.options.moveUp(); },
      Right:    function(ev) { U.stop(ev); self.options.moveRight(); },
      Down:     function(ev) { U.stop(ev); self.options.moveDown(); }
    });

    this.proxy = $('<input type="text" class="proxy" />')
      .attr({ 'aria-hidden': 'true' })
      .focus(function(e)  { return self.onFocus(e); })
      .blur(function(e)   { return self.onBlur(e); })
      .keydown(this.keyboard.trigger)
      .appendTo(el);

    this.el.width(this.options.width());

    bindRelated(el, function() {
      self.proxy.focus();
    });

    if (value === undefined)
      value = el.attr('data-value');
    if (value === undefined)
      value = this.options.value();

    this.init(el, value || '');
  }

  Select.prototype.value = function() {
    return this.attr('data-value');
  };

  Select.prototype.update = function(value) {
    this.attr('data-value', this.options.update(value).value());
    return this.draw();
  };

  Select.prototype.change = function(value) {
    if (this.value() != this.update(value).value()) {
      this.el.trigger('change');
      this.emit('change');
    }
    return this;
  };

  Select.prototype.isOpen = function() {
    return this.el.is('.open');
  };

  Select.prototype.toggleOpen = function() {
    this.options.toggleActive();
    return this;
  };

  Select.prototype.open = function() {
    this.options.activate();
    return this;
  };

  Select.prototype.close = function() {
    this.options.deactivate();
    return this;
  };

  Select.prototype.onFocus = function(ev) {
    this.el.addClass('focus');
  };

  Select.prototype.onBlur = function(ev) {
    this.el.removeClass('focus');
  };

  Select.prototype.onClick = function(ev) {
    this.toggleOpen();
  };

  Select.prototype.onMouseEnter = function(ev) {
    this.el.addClass('hover');
  };

  Select.prototype.onMouseLeave = function(ev) {
    this.el.removeClass('hover');
  };

  Select.prototype.draw = function() {
    this.el
      .children('[aria-selected]').remove().end()
      .append(this.options.selected().clone());
    return this;
  };

  
  // ## Options ##

  function Options(input, value) {
    var self = this;

    this.input = input;

    this.modal = D.modal()
      .addClass('option-modal')
      .offset('left below', input.el)
      .on('clickout', function() { self.deactivate(); })
      .keys({
        Return: function(ev) { U.stop(ev); self.onReturn(ev); }
      })
      .appendTo('body');

    this.options(input.el.children());
  }

  Options.prototype.on = function(name, fn) {
    var self = this;
    this.modal.on(name, function() { fn.apply(self, arguments); });
    return this;
  };

  Options.prototype.width = function() {
    return this.modal.width();
  };

  Options.prototype.isActive = function() {
    return this.modal.isActive();
  };

  Options.prototype.activate = function() {
    this.modal.activate();
    return this;
  };

  Options.prototype.deactivate = function() {
    this.modal.deactivate();
    return this;
  };

  Options.prototype.toggleActive = function() {
    return this.isActive() ? this.deactivate() : this.activate();
  };

  Options.prototype.value = function() {
    return this.valueOf(this.selected());
  };

  Options.prototype.update = function(value) {
    var probe = this.findValue(value);
    if (!probe.length)
      probe = this.defaultItem();
    return this.select(probe);
  };

  Options.prototype.change = function(el) {
    this.input.change(this.valueOf(el));
    return this;
  };

  Options.prototype.findValue = function(value) {
    return this.filter('[data-value=' + value + ']');
  };

  Options.prototype.valueOf = function(el) {
    return el.data('value');
  };

  Options.prototype.options = function(opt) {
    if (!arguments.length)
      return this.modal.children();
    else {
      var self = this;
      opt.each(function() {
        self.makeItem($(this)).appendTo(self.modal);
      });
      return this;
    }
  };

  Options.prototype.filter = function(selector) {
    return this.options().filter(selector);
  };

  Options.prototype.selected = function() {
    return this.filter('[aria-selected=true]');
  };

  Options.prototype.select = function(el) {
    this.selected().attr({ 'aria-selected': 'false' });
    el.attr({ 'aria-selected': 'true' });
    return this;
  };

  Options.prototype.defaultItem = function() {
    return this.filter(':eq(0)');
  };

  Options.prototype.moveUp = function() {
    return this.move('prev');
  };

  Options.prototype.moveRight = function() {
    return this.move('next');
  };

  Options.prototype.moveDown = function() {
    return this.move('next');
  };

  Options.prototype.moveLeft = function() {
    return this.move('prev');
  };

  Options.prototype.move = function(dir) {
    var choice = this.selected();

    if ((choice = choice[dir]()).length > 0)
      this.change(choice);

    return this;
  };

  Options.prototype.makeItem = function(el) {
    var self = this;
    return el
      .attr({ 'aria-selected': el.attr('aria-selected') || 'false' })
      .bind('mouseenter.option', function() {
        self.select(el);
      })
      .bind('click.option', function() {
        self.change(el).deactivate();
      });
  };

  Options.prototype.onReturn = function() {
    this.selected().click();
  };

  
  // ## Helpers ##

  function bindRelated(el, callback) {
    var id = el.attr('id');
    if (id)
      U.nextTick(function() {
        $('[for=' + id + ']').click(callback);
      });
  }

});