define(['exports', './util'], function(exports, U) {

  
  // ## Console ##

  exports.log = log;
  exports.debug = debug;
  exports.warn = warn;
  exports.error = error;
  exports.fail = error;

  function log() {
    display('log', arguments);
  }

  function debug() {
    display('debug', arguments);
  }

  function warn() {
    display('warn', arguments);
  }

  function error() {
    display('error', arguments);
  }

  function fail() {
    display('error', arguments);
    throw new Error(formatArgs(arguments));
  }

  var display;
  if (window.console && window.console.log.apply) {
    display = function(label, args) {
      console[label].apply(console, args);
    };
  }
  else if (window.console) {
    display = function(label, args) {
      var message = formatArgs(args);
      if (label != 'log')
        message = label.toUpperCase() + ' :: ' + message;
      console.log(message);
    };
  }
  else {
    display = function(label, args) {
      alert('Error: ' + formatArgs(args));
    };
  }

  
  // ## Error ##

  exports.Error = window.Error || Error;

  function Error(message) {
    this.message = message;
  }

  Error.prototype.toString = function() {
    return 'Error: ' + this.message;
  };

  
  // Callback-style

  exports.noop = noop;

  function noop(err) {
    if (err) error(err);
  };

  
  // ## String Formatting ##

  function formatArgs(info) {
    return U.map(info, format).join(' ');
  }

  function format(obj) {
    switch(typeof obj) {
    case 'number':
    case 'string':
    case 'boolean':
    case 'undefined':
      return obj.toString();

    default:
      if (obj === null)
        return 'null';
      else if ($.isArray(obj))
        return '[' + U.map(obj, format).join(' ') + ']';
      else
        try {
          return JSON.stringify(obj);
        } catch (x) {
          return obj.toString();
        }
    }
  }

});