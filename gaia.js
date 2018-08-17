class Field {
  constructor(size, svg, tiles) {
    this.size = size
    this.svg = svg
    this.svg.attr({height: size * 15 * Math.sqrt(3), width: size * 15 * 2})
    this.svg.empty()
    this.tiles = tiles !== undefined ? tiles.split(/[,\s]+/) : [1, "5B", 2, 3, "6B", 4, "7B"]
    this.rotates = {}
  }

  draw() {
    const self = this
    this.centers.forEach(function(pt, i) {
      self.tile(pt[0], pt[1], self.tiles[i], 0)
    })
  }

  rotate(tile) {
    const index = this.tiles.findIndex(e => e == tile)
    const center = this.centers[index]
    if (this.rotates[tile] === undefined)
      this.rotates[tile] = 1
    else
      this.rotates[tile] = this.rotates[tile] + 1
    this.svg.find(`#tile-${tile}`).remove()
    this.tile(center[0], center[1], tile, this.rotates[tile])
  }

  get centers() {
    return [[6, 0], [11, -2], [3, 5], [8, 3], [13, 1], [5, 8], [10, 6]]
  }

  get tile_points() {
    const x = [[0, 2], [-1, 2], [-2, 2], [-2, 1], [-2, 0]]
    var res = []
    x.forEach(function(rr, i){
      for (var r = rr[0]; r <= rr[1]; r++)
        res.push({q: i - 2, r: r})
    })
    return res
  }

  tile(qo, ro, tname, rot) {
    let self = this;
    let g = this.tag("g", {id: `tile-${tname}`, class: 'tile'})
    g.data({name: tname})
    this.svg.append(g)
    this.tile_points.forEach(function(pt){
      g.append(self.hex(pt.q + qo, pt.r + ro, self.planet(tname, pt.q, pt.r, rot), tname))
    })
  }

  hex(q, r, planet, tile) {
    let offset = this.offset(q, r)
    let group = this.tag("g", {q: q, r: r, transform: `translate(${offset.x}, ${offset.y})`})
    let polygon = this.tag("polygon", {points: this.points()})
    polygon.data({tile: tile, coord: [q, r]})
    group.append(polygon)
    if (planet !== undefined) {
      let circle = this.tag("circle", {class: `planet-${planet}`, r: this.size * 0.6})
      circle.data({planet: planet})
      group.append(circle)
    }
    //let txt = this.tag("text", {transform: "translate(-10, 4)"})
    //txt.append(`${q}:${r}`)
    //group.append(txt)
    return group
  }

  offset(q, r) {
    return {x: this.size * 1.5 * q, y: this.size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r)}
  }

  points() {
    const size = this.size;
    return [0, 1, 2, 3, 4, 5, 6].map(function(i){
        const angle = 60.0 * i * Math.PI / 180
        return `${size * Math.cos(angle)},${size * Math.sin(angle)}`
    })
  }

  tag(name, attrs) {
    var elem = $(document.createElementNS("http://www.w3.org/2000/svg", name))
    elem.attr(attrs)
    return elem
  }

  // right rotate
  rot(q, r, n) {
    for (var i = 0; i < n; i++) {
      let pt = [-r, q + r]
      q = pt[0]
      r = pt[1]
    }
    return {q: q, r: r}
  }

  planet(tname, x, y, rot) {
    rot = rot !== undefined ? rot : 0
    let tile = Field.planets[tname]
    let pt = this.rot(x, y, rot)
    if (tile !== undefined && tile[pt.q] !== undefined)
      return tile[pt.q][pt.r]
  }

  static get planets() {
    return {"1":{"1":{"-1":"terra","1":"volcanic"},"-2":{"1":"desert"},"-1":{"0":"swamp"},"0":{"2":"oxide"},"2":{"-1":"transdim"}},"3":{"-1":{"2":"terra","0":"gaia"},"0":{"2":"desert","-2":"transdim"},"2":{"-1":"titanium"},"1":{"0":"ice"}},"4":{"2":{"0":"terra"},"1":{"0":"swamp"},"0":{"-1":"oxide","-2":"titanium"},"-1":{"1":"volcanic"},"-2":{"1":"ice"}},"6B":{"1":{"-1":"terra","-2":"transdim","1":"transdim"},"2":{"0":"desert"},"0":{"1":"gaia"}},"6":{"1":{"-1":"terra","1":"transdim","-2":"transdim"},"2":{"0":"desert"},"-1":{"0":"swamp"},"0":{"1":"gaia"}},"8":{"0":{"-2":"terra"},"-1":{"1":"volcanic","2":"transdim"},"1":{"0":"ice"},"2":{"-2":"transdim"}},"10":{"-2":{"2":"terra"},"-1":{"0":"desert","2":"oxide"},"1":{"0":"gaia","-2":"transdim"},"2":{"-2":"transdim"}},"2":{"2":{"-1":"desert"},"-1":{"1":"swamp","2":"oxide","-1":"volcanic"},"0":{"-2":"titanium"},"1":{"-1":"ice","1":"transdim"}},"5":{"0":{"1":"desert","-2":"ice"},"2":{"-1":"oxide","-2":"transdim"},"-1":{"2":"volcanic","0":"gaia"}},"7B":{"1":{"0":"swamp"},"0":{"2":"titanium","-1":"gaia"},"-1":{"1":"gaia"},"-2":{"0":"transdim"}},"7":{"1":{"-2":"swamp","0":"gaia"},"0":{"-1":"oxide","2":"titanium"},"-1":{"1":"gaia"},"-2":{"0":"transdim"}},"9":{"-2":{"2":"swamp"},"-1":{"-1":"volcanic","1":"ice"},"1":{"0":"gaia","-2":"transdim"}},"5B":{"2":{"-1":"oxide","-2":"transdim"},"-1":{"2":"volcanic","0":"gaia"},"0":{"-2":"ice"}}}
  }
}

class Faction {
  constructor(name) {
    this.factory(name)
  }

  static get terraforming() {
    return {terra: 0, oxide: 1, volcanic: 2, desert: 3, swamp: 4, titanium: 5, ice: 6};
  }

  terraforming_steps(planet) {
    const idx1 = Faction.terraforming[this.planet]
    const idx2 = Faction.terraforming[planet]
    const steps = [0, 1, 2, 3, 3, 2, 1]
    return steps[Math.abs(idx1 - idx2)]
  }

  factory(name) {
    const factions = {
      Geodens: {planet: "volcanic"}
    }
    this.planet = factions[name].planet
  }
}
