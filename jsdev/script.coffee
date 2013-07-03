# Setup scrollsmartly
smartly.set {
  position: 'center',
  marginLeft: 150,
  easing: 5
}

smartly.all()

$ ->
  $('.to-about')
  .css('cursor', 'pointer')
  .on 'click', ->
    smartly.scroll a0, a1

  $('.to-start')
  .css('cursor', 'pointer')
  .on 'click', ->
    smartly.scroll b0, b1

  $('.to-method')
  .css('cursor', 'pointer')
  .on 'click', ->
    smartly.scroll c0, c1
