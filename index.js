$(function(){
  window.log = function(text) {
    let li = $(`<li>${text}</li>`)
    $('#log').append(li)
  }

  window.init = function(tiles) {
    window.field = new Field(30, $('#field'), tiles)
    field.draw()
    window.log(`init(${tiles})`)
  }

  init($('#order').val())

  $("#order").on("change", function(){
    init($(this).val())
  })

  //$(document).on("click", "polygon", {}, function(){
  //  let $this = $(this)
  //  let name = $this.parents('g.tile').data('name')
  //  field.rotate(name)
  //  log(`rotate(${name})`)
  //})

  $(document).on("mouseenter", "g.hex", {}, function(){
    let $this = $(this)
    //let polygon = $this.parent().find('polygon')
    let polygon = $this.find('polygon')
    let circle = $this.find('circle')
    let planet = circle.data("planet")
    $('#info').html(`${planet === undefined ? 'none' : planet} @ (${polygon.data('coord').join(', ')})`)
  })

  $(document).on("mouseleave", "g.hex", function(){
    $('#info').html('&nbsp;')
  })

  $(document).on("click", "g.hex", function(){
    let hex = $(this)
    let coord = `${hex.attr('q')},${hex.attr('r')}`
    $("#coord").val(coord)
  })

  $("#run").on("click", function(){
    let log = $('#log')
    let init = $('#init').val()
    let tiles = init.split(/[,\s]+/)
    let z = tiles.map(function(t){
      let x = t.split(/#/)
      return [x[0], x[1] === undefined ? 0 : parseInt(x[1])]
    })
    let x = z.map(a => a[0])
    window.init(x.join(', '))
    z.forEach(function(a){
      for (var i = 0; i < a[1]; i++) {
        window.field.rotate(a[0])
        window.log(`rotate(${a[0]})`)
      }
    })
  })

  $("#action").on("click", function(){
    let struct = $("#struct option:selected").val()
    let $coord = $("#coord").val()
    let coord = $coord.split(/[,\s]+/)
    field.place(coord[0], coord[1], struct, "desert")
  })
})

