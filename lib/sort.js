define(['exports', './util', './mouse', './view', './position'],
function(exports, U, M, V, P) {

  
  // ## Sort ##

  exports.Sortable = Sortable;

  $.defView('sortable', Sortable);
  function Sortable(el, value) {
    $.View.call(this, el, value);

    this.itemTemplate = U.contentTemplate(el);

    var self = this;

    this.onStart = function(state) { self.start(state); };
    this.onEnd   = function(state) { self.end(state); };
    this.onDrop  = function(state) { self.drop(state); };
    this.onMoved = function(state, ev) { self.moved(state, ev); };
  }

  Sortable.prototype.items = function() {
    return this.el.children();
  };

  Sortable.prototype.each = function(fn, ctx) {
    U.each(this.items(), fn, ctx);
    return this;
  };

  Sortable.prototype.map = function(fn, ctx) {
    return U.reduce(this, [], function(r, v, i, s) { r[i] = fn.call(ctx, v, i, s); });
  };

  Sortable.prototype.eq = function(index) {
    return this.items().eq(index);
  };

  Sortable.prototype.value = function() {
    return this.map(V.value);
  };

  Sortable.prototype.update = function(value) {
    U.each(value, this.push, this.empty());
    return this;
  };

  Sortable.prototype.push = function(value) {
    this.makeItem(value).appendTo(this.el);
    return this;
  };

  Sortable.prototype.makeItem = function(value) {
    var el = $.tmpl(this.itemTemplate, value);
    el.data('sort', (new M.Drag(el))
      .on('start', this.onStart)
      .on('moved', this.onMoved)
      .on('end', this.onEnd));
    this.emit('makeItem', el);
    return el;
  };

  Sortable.prototype.start = function(state) {
    this.el.addClass('sorting');

    state.inOut = this.el.add(state.ghost)
      .addClass('inside');

    state.items = this.items();

    state.drops = state.items.not(state.el)
      .addClass('droppable');

    state.drop = null;
  };

  Sortable.prototype.end = function(state) {
    if (state.drop && state.drop.is('.droppable'))
      state.accept(this.onDrop);

    this.el.removeClass('sorting');

    state.inOut.removeClass('inside outside');

    state.items
      .removeClass('droppable before after delta');

    state.items = state.drops = state.drop = state.inOut = null;
  };

  Sortable.prototype.moved = function(state, ev) {
    var next = findItem(ev, state.items),
        last = state.drop;

    if (next && last && next[0] == last[0])
      return; // Still over the same item.
    else if (!(next || last))
      return; // Still outside.

    if (last)
      this.leave(state, next);

    if ((state.drop = next))
      this.enter(state, last);
    else if (!P.isIn(ev, this.el))
      this.outside(state, last);
  };

  Sortable.prototype.drop = function(state) {
    this.leave(state);
    state.drop[this.locate(state)](state.el);
    this.emit('change', state);
  };

  Sortable.prototype.enter = function(state, last) {
    if (!last && state.inOut.is('.outside'))
      this.inside(state);

     state.drop.addClass('hover');

    var dir = this.locate(state),
        delta = this.changed(state)
          .addClass('delta')
          .addClass(dir);

    state.items.not(delta).removeClass('delta before after');

    this.emit('enter', state, last);
  };

  Sortable.prototype.leave = function(state, next) {
    this.emit('leave', state, next);
    state.drop.removeClass('hover');
    if (!next)
      state.drop.removeClass('delta before after');
  };

  Sortable.prototype.outside = function(state, last) {
    state.inOut.removeClass('inside').addClass('outside');
    state.items.removeClass('before after delta');
    this.emit('outside', state, last);
  };

  Sortable.prototype.inside = function(state) {
    state.inOut.removeClass('outside').addClass('inside');
    this.emit('inside');
  };

  Sortable.prototype.locate = function(state) {
    var items = state.items,
        src = state.el,
        dst = state.drop;
    return (items.index(src) < items.index(dst)) ? 'after' : 'before';
  };

  Sortable.prototype.changed = function(state) {
    var items = state.items,
        start = items.index(state.el),
        end = items.index(state.drop);
    return items.slice(Math.min(start, end), Math.max(start, end) + 1);
  };

  
  // ## Helpers ##

  function findItem(obj, elems) {
    var el, point = P.offset(obj);
    for (var i = elems.length - 1; i >= 0; i--) {
      if (point.isIn(el = elems.eq(i)))
        return el;
    }
    return null;
  }

  function midpoint(obj) {
    var point = P.offset(obj);
    point.top += obj.outerHeight() / 2;
    point.left += obj.outerWidth() / 2;
    return point;
  }

});