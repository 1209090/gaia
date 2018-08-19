class Drawer {
  constructor(svg, field, size) {
    this.svg = svg
    this.field = field
    this.size = size || 25
    this.svg.attr({height: this.size * 15 * Math.sqrt(3), width: this.size * 15 * 2})
  }

  draw() {
    const self = this
    this.svg.empty()
    this.field.eachHex(h => {
      const offset = self.offset(h)
      const group = self.tag("g", {class: 'hex', q: h.point.q, r: h.point.r, transform: `translate(${offset.x}, ${offset.y})`})
      let polygon = self.tag("polygon", {points: self.points})
      polygon.data({hex: h, human: h.toString()})
      group.append(polygon)
      if (h.planet !== undefined) {
        const circle = self.tag("circle", {class: `planet-${h.planet}`, r: self.size * 0.7})
        group.append(circle)
      }
      if (h.local == "(0, 0)") {
        const txt = self.tag("text", {transform: "translate(-6, 4)"})
        txt.append(h.tile)
        group.append(txt)
      }
      self.svg.append(group)
    })
  }

  tag(name, attrs) {
    var elem = $(document.createElementNS("http://www.w3.org/2000/svg", name))
    elem.attr(attrs)
    return elem
  }

  offset(hex) {
    const q = hex.point.q, r = hex.point.r
    const gl = [[-1, -1], [0, -1], [-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1]][hex.position].map(e => e / 10)

    return {x: this.size * (1.5 * q + gl[0]), y: this.size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r + gl[1])}
  }

  get points() {
    const size = this.size;
    return [0, 1, 2, 3, 4, 5, 6].map(i => {
        const angle = 60.0 * i * Math.PI / 180
        return `${size * Math.cos(angle)},${size * Math.sin(angle)}`
    })
  }
}
