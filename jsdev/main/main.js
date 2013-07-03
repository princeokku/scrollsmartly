(function() {
  smartly.set({
    position: 'center',
    marginLeft: 150,
    easing: 5
  });

  smartly.all();

  $(function() {
    $('.to-about').css('cursor', 'pointer').on('click', function() {
      return smartly.scroll(a0, a1);
    });
    $('.to-start').css('cursor', 'pointer').on('click', function() {
      return smartly.scroll(b0, b1);
    });
    $('.to-method').css('cursor', 'pointer').on('click', function() {
      return smartly.scroll(c0, c1);
    });
    return $('.to-property').css('cursor', 'pointer').on('click', function() {
      return smartly.scroll(i0, i1);
    });
  });

}).call(this);

/*
//@ sourceMappingURL=main.js.map
*/