define(['exports', './util', './keyboard', './view', './position'],
function(exports, U, Kb) {

  
  // ## Dialog ##

  exports.dialog = dialog;
  exports.Dialog = Dialog;

  function dialog(value) {
    var content = $('<div class="dialog-content" />')
      .html(value ? $(value) : '');

    return $('<div role="dialog" />')
      .append('<div class="buttons"><a href="#" class="dialog-close">&times;</a></div>')
      .append(content)
      .view(null);
  }

  $.defView('dialog', Dialog);
  function Dialog(el) {
    $.View.call(this, el);

    this.content = $('.dialog-content', this.el);
    this.keyboard = null;
    this._position = null;

    this
      .on('activate',   function() { this.onOpen(); })
      .on('deactivate', function() { this.onClose(); });
  };

  Dialog.prototype.appendTo = function(obj) {
    (obj.append ? obj : $(obj)).append(this.get());
    return this;
  };

  Dialog.prototype.append = function(content) {
    this.content.append(content.get ? content.get() : content);
    return this;
  };

  Dialog.prototype.children = function() {
    return this.content.children();
  };

  Dialog.prototype.find = function(selector) {
    return this.content.find(selector);
  };

  Dialog.prototype.width = function(selector) {
    return this.content.width();
  };

  Dialog.prototype.keys = function(name, fn) {
    if (!this.keyboard)
      this.keyboard = new Kb.Keyboard();
    this.keyboard.define(name, fn);
    return this;
  };

  Dialog.prototype.offset = function(where, relativeTo) {
    var self = this;
    this._offset = function() {
      self.el.offset(where, relativeTo);
    };
    return this;
  };

  Dialog.prototype.onOpen = function(close) {
    var self = this;

    if (this.keyboard)
      $('html').bind('keydown.dialog', this.keyboard.trigger);

    if (!this._offset)
      this.offset('center');
    this._offset();

    this.el.find('.dialog-close')
      .bind('click.dialog', function(ev) {
        U.stop(ev);
        (close || self.deactivate).call(self);
      });
  };

  Dialog.prototype.onClose = function() {
    this.el.find('.dialog-close').unbind('.dialog');
    $('html').unbind('.dialog');
  };

  
  // ## Modal ##

  exports.modal = modal;
  exports.Modal = Modal;

  function modal(value) {
    return $('<div role="modal"><div class="modal-overlay" /></div>')
      .append(dialog(value))
      .view(null);
  }

  $.defView('modal', Modal);
  function Modal(el) {
    $.View.call(this, el);

    this.overlay = el.find('.modal-overlay');
    this.dialog = el.find('[role~=dialog]').view(null);

    var self = this;

    self.close = function() { self.deactivate(); };
    self.clickOut = function(ev) { self.onClickOut(ev); };

    this
      .on('activate',   function() { this.onOpen(); })
      .on('deactivate', function() { this.onClose(); })
      .keys({
        ESC: self.close
      });
  }

  Modal.prototype.onOpen = function() {
    this.dialog.onOpen(this.close);
    this.overlay.bind('click.modal', this.clickOut);
  };

  Modal.prototype.onClose = function() {
    this.overlay.unbind('.modal');
    this.dialog.onClose();
  };

  Modal.prototype.onClickOut = function() {
    this.emit('clickout');
  };

  Modal.prototype.appendTo = function(obj) {
    (obj.append ? obj : $(obj)).append(this.get());
    return this;
  };

  U.each(['append', 'keys', 'offset'],
    function(method) {
      Modal.prototype[method] = function() {
        this.dialog[method].apply(this.dialog, arguments);
        return this;
      };
    });

  U.each(['find', 'children', 'width'],
    function(method) {
      Modal.prototype[method] = function() {
        return this.dialog[method].apply(this.dialog, arguments);
      };
    });

});