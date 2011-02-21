define(['exports', './util', './events', './position', './style'],
function(exports, U, E, P) {

  
  // ## Drag ##

  exports.Drag = Drag;

  U.inherits(Drag, E.EventEmitter);
  function Drag(selector, opt) {
    E.EventEmitter.call(this);

    var el = this.el = $(selector);
    this.options = opt = opt || {};
    this.down = down;

    this.init();

    var self = this,
        win = $('html'),
        orig,
        state;

    function down(ev) {
      if (isLeftClick(ev)) {
        ev.preventDefault(); // Prevent region highlight.
        state = null;
        orig = captureOffset(el, ev);
        win.bind('mousemove.Drag', move).bind('mouseup.Drag', up);
      }
    }

    function move(ev) {
      if (!self.emit('move', state || start(), ev))
        state.follow(ev);
      self.emit('moved', state, ev);
    }

    function up(ev) {
      ev.preventDefault();
      win.unbind('mousemove.Drag', move).unbind('mouseup.Drag', up);
      state && end();
    }

    function start() {
      state = new DragState(el, orig);
      self.emit('start', state);
      return state.start();
    }

    function end() {
      self.emit('end', state);
      state.end(function() {
        if (this === state) {
          state = null;
          orig = null;
        }
      });
    }
  }

  Drag.prototype.init = function() {
    this.el
      .attr({ unselectable: 'on', draggable: '' })
      .bind('dragstart', U.never)
      .mousedown(this.down);
    return this;
  };

  Drag.prototype.destroy = function() {
    this.emit('destroy');
    el.removeAttr('unselectable')
      .removeAttr('draggable')
      .unbind('dragstart', U.never)
      .unbind('mousedown', this.down);
    return this;
  };

  Drag.prototype.$ = function() {
    return this.el;
  };

  function captureOffset(el, relativeTo) {
    return {
      offset: P.offset(el),
      delta: P.offset(relativeTo).subtract(el)
    };
  }

  function DragState(el, capture) {
    this.el = el;
    this.ghost = undefined;
    this.accepted = false;

    this.offset = capture.offset;
    this.delta = capture.delta;
  }

  DragState.prototype.start = function() {
    if (!this.ghost)
      this.ghost = this.makeGhost();
    this.el.addClass('dragging');
    return this;
  };

  DragState.prototype.end = function(callback) {
    var self = this;

    if (this.ghost) {
      this.accepted ? done() : this.snapBack(done);
    }

    function done() {
      self.ghost.remove();
      self.el.removeClass('dragging');
      callback && callback.call(self);
    }

    return this;
  };

  DragState.prototype.move = function(where) {
    this.ghost.css('top', where.top).css('left', where.left);
    return this;
  };

  DragState.prototype.follow = function(ev) {
    return this.move(P.offset(ev).subtract(this.delta));
  };

  DragState.prototype.snapBack = function(callback) {
    this.ghost.animate(this.offset.css(), 'fast', 'swing', callback);
    return this;
  };

  DragState.prototype.accept = function(move) {
    this.accepted = true;
    if (move)
      move(this);
    else if (this.ghost)
      P.move(this.el, this.ghost);
    return this;
  };

  DragState.prototype.makeGhost = function() {
    var el = this.el;
    return el.snapshot()
      .attr('className', 'ghost')
      .css({
          position: 'absolute',
          width: el.width(), height: el.height(),
          margin: 0,
          opacity: 0.75
      })
      .css(this.offset.css())
      .appendTo('body');
  };

  
  // ## Mouse Events ##

  exports.isLeftClick = isLeftClick;

  function isLeftClick(ev) {
    return ev.button == ($.browser.msie ? 1 : 0);
  }

});