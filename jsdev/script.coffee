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

  $('.to-property')
  .css('cursor', 'pointer')
  .on 'click', ->
    smartly.scroll i0, i1

  $('.to-event')
  .css('cursor', 'pointer')
  .on 'click', ->
    smartly.scroll l0, l1

  $('.example')
  .css('cursor', 'pointer')
  
  $('.basicscroll').on 'click', ->
    smartly.scroll(a1, b1, c1, d1, e1, f1, g1, h1, i1, c1)
  
  $('.delay').on 'click', ->
    smartly.scroll(d2, ->
      alert('1秒待ちます')
    ).delay(1000).scroll(d1)

  $('.setleft').on 'click', ->
    smartly
    .set
      position: 'left, top'
      marginLeft: 250
    .scroll h1, ->
      alert('スクロール先を左上に設定しました')
      smartly.set
        position: 'center'
        marginLeft: 150
      .scroll h1, ->
        alert('スクロール先を中央に設定しました')
      
  $('pre').addClass 'brush: js'
  SyntaxHighlighter.all()
  setTimeout ->
    $('.syntaxhighlighter .toolbar').remove()
  , 300
  
  