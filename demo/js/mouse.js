define(['./hi/mouse'], function(M) {
  $(function() {
    var drag = new M.Drag('#drag')
      .on('end', function(state) {
        state.accept();
      });
  });
});