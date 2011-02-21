define(['exports', './util', './hi'], function(exports, U, I) {

  exports.EventEmitter = EventEmitter;

  function EventEmitter() {
    this._listeners = {};
  }

  EventEmitter.prototype.listeners = function(name) {
    var handlers = this._listeners[name];
    if (handlers === undefined)
      handlers = this._listeners[name] = [];
    return handlers;
  };

  EventEmitter.prototype.on = function(name, fn) {
    this.listeners(name).push(fn);
    this.emit('newListener', fn);
    return this;
  };

  EventEmitter.prototype.removeListener = function(name, fn) {
    U.remove(this.listeners(name), fn);
    return this;
  };

  EventEmitter.prototype.removeAllListeners = function(name) {
    delete this._listeners[name];
    return this;
  };

  EventEmitter.prototype.emit = function(name, a) {
    if (!name) I.fail('emit: missing required event name.');

    var handlers = this._listeners[name];

    if (!handlers) {
      // Special case: unhandled error is thrown.
      if (name == 'error')
        I.fail.apply(null, arguments.length > 1 ? U.toArray(arguments, 1) : ['unhandled error']);
      return false;
    }

    // Special case: no arguments.
    if (arguments.length == 1) {
      for (var i = 0, l = handlers.length; i < l; i++)
        handlers[i].call(this);
        // try { handlers[i].call(this); }
        // catch (x) { I.warn(x + ' (while handling `' + name + '`)'); }
    }
    // Special case: one argument.
    else if (arguments.length == 2) {
      for (var i = 0, l = handlers.length; i < l; i++)
        handlers[i].call(this, a);
        // try { handlers[i].call(this, a); }
        // catch (x) { throw x; I.warn(x + ' (while handling `' + name + '`)'); }
    }
    // General case.
    else {
      var args = U.toArray(arguments, 1);
      for (var i = 0, l = handlers.length; i < l; i++)
        handlers[i].apply(this, args);
        // try { handlers[i].apply(this, args); }
        // catch (x) { throw x; I.warn(x + ' (while handling `' + name + '`)'); }
    }

    return true;
  };

});