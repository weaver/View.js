define(['./hi/index', './hi/sort', './hi/form', './js/jquery.color.js'],
function(Hi, Sort) {

  
  // ## Application Logic (e.g. Controller) ##

  $.defView('#demo', Demo);
  function Demo(el, value) {
    $.View.call(this, el, value);

    var self = this,
        form = el.children('form').view({}),
        list = this.list = el.children('ul').view(value);

    form.on('submit', function() {
      changed(list.push(this.value()).eq(-1));
      this.reset();
      self.emit('change');
    });

    list
      .on('change', function(state) {
        changed(this.changed(state));
        self.emit('change');
      })
      .on('makeItem', function(item) {
        item.find('.remove')
          .click(function() {
            vanish(item, function() { self.emit('change'); });
          });
      });
  }

  Demo.prototype.update = function(value) {
    this.list.update(value);
    return this;
  };

  Demo.prototype.value = function() {
    return this.list.value();
  };

  
  // ## Effects ##

  function changed(el) {
    return el
      .highlight('changed', true)
      .fadeBack(500, 'swing');
  }

  function vanish(el, callback) {
    return el
      .highlight('changed')
      .fadeOut(200, function() {
        $(this).remove();
        callback && callback();
      });
  }

  
  // ## Setup ##

  $(function() {
    $('#demo')
      .view($.map(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'], box))
      .on('change', function() {
        Hi.log('new value:', $.map(this.value(), unbox));
      });
  });

  function box(v) {
    return { value: v };
  }

  function unbox(o) {
    return o.value;
  }

});