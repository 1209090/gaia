class Point {
  constructor(q, r) {
    this.q = q
    this.r = r
  }

  toString() {
    return `(${this.q}, ${this.r})`
  }

  neighbors(n) {
    let res = []
    for (let ix = -n; ix <= n; ix += 1) {
      for (let iy = -n; iy <= n; iy += 1) {
        for (let iz = -n; iz <= n; iz += 1) {
          if (ix + iy + iz == 0)
            res.push(new Point(this.q + ix, this.r + iz))
        }
      }
    }
    return res;
  }

  distance(pt) {
    let diff = [this.q - pt.q, this.r - pt.r, this.q + this.r - pt.q - pt.r].map(e => Math.abs(e))
    return Math.max(...diff)
  }
  /*
   function cube_distance(a, b):
     return max(abs(a.x - b.x), abs(a.y - b.y), abs(a.z - b.z))
   */
}

class Hex {
  constructor(point, position, tile, planet, local) {
    this.point = point
    this.position = position
    this.tile = tile
    this.planet = planet
    this.local = local
  }

  toString() {
    return `${this.planet || 'none'} @ ${this.point} / ${this.local}`
  }
}

class Field {
  constructor(tiles, rotates) {
    this.tiles = tiles === undefined ? [1, "5B", 2, 3, "6B", 4, "7B"] : tiles
    this.rotates = rotates === undefined ? this.tiles.map(_ => 0) : rotates
    this.init_hexes()
  }

  hex(pt) {
    return this.hexes[pt]
  }

  eachHex(f) {
    const self = this
    Object.keys(this.hexes).forEach(pt => f(self.hex(pt)))
  }

  init_hexes() {
    const self = this
    this.hexes = {}
    this.centers.forEach(c =>
      c.neighbors(2).forEach(pt =>
        self.hexes[pt] = self.init_hex(pt)
      )
    )
  }

  rotate(pt, number) {
    let q = pt.q, r = pt.r
    for (let i = 0; i < number; i++) {
      let tmp = [-r, q + r]
      q = tmp[0]
      r = tmp[1]
    }
    return new Point(q, r)
  }

  init_hex(pt) {
    let offsets = this.centers.map(e => new Point(pt.q - e.q, pt.r - e.r))
    let position = this.centers.findIndex(e => e.distance(pt) <= 2)
    let tile = this.tiles[position]
    let local = offsets[position]
    let rotated = this.rotate(local, this.rotates[position] || 0)
    let planet = Field.pls[tile][rotated]

    return new Hex(pt, position, tile, planet, local)
  }

  get centers() {
    return [[6, 0], [11, -2], [3, 5], [8, 3], [13, 1], [5, 8], [10, 6]].map(e => new Point(...e))
  }

  static get planets() {
    return {
      "1":{"1":{"-1":"terra","1":"volcanic"},"-2":{"1":"desert"},"-1":{"0":"swamp"},"0":{"2":"oxide"},"2":{"-1":"transdim"}},
      "2":{"2":{"-1":"desert"},"-1":{"1":"swamp","2":"oxide","-1":"volcanic"},"0":{"-2":"titanium"},"1":{"-1":"ice","1":"transdim"}},
      "3":{"-1":{"2":"terra","0":"gaia"},"0":{"2":"desert","-2":"transdim"},"2":{"-1":"titanium"},"1":{"0":"ice"}},
      "4":{"2":{"0":"terra"},"1":{"0":"swamp"},"0":{"-1":"oxide","-2":"titanium"},"-1":{"1":"volcanic"},"-2":{"1":"ice"}},
      "5":{"0":{"1":"desert","-2":"ice"},"2":{"-1":"oxide","-2":"transdim"},"-1":{"2":"volcanic","0":"gaia"}},
      "5B":{"2":{"-1":"oxide","-2":"transdim"},"-1":{"2":"volcanic","0":"gaia"},"0":{"-2":"ice"}},
      "6":{"1":{"-1":"terra","1":"transdim","-2":"transdim"},"2":{"0":"desert"},"-1":{"0":"swamp"},"0":{"1":"gaia"}},
      "6B":{"1":{"-1":"terra","-2":"transdim","1":"transdim"},"2":{"0":"desert"},"0":{"1":"gaia"}},
      "7":{"1":{"-2":"swamp","0":"gaia"},"0":{"-1":"oxide","2":"titanium"},"-1":{"1":"gaia"},"-2":{"0":"transdim"}},
      "7B":{"1":{"0":"swamp"},"0":{"2":"titanium","-1":"gaia"},"-1":{"1":"gaia"},"-2":{"0":"transdim"}},
      "8":{"0":{"-2":"terra"},"-1":{"1":"volcanic","2":"transdim"},"1":{"0":"ice"},"2":{"-2":"transdim"}},
      "9":{"-2":{"2":"swamp"},"-1":{"-1":"volcanic","1":"ice"},"1":{"0":"gaia","-2":"transdim"}},
      "10":{"-2":{"2":"terra"},"-1":{"0":"desert","2":"oxide"},"1":{"0":"gaia","-2":"transdim"},"2":{"-2":"transdim"}}
    }
  }

  static get pls() {
    let res = {}
    const planets = Field.planets
    Object.keys(planets).forEach(t => {
      let tile = planets[t];
      Object.keys(tile).forEach(q => {
        let p = tile[q]
        Object.keys(p).forEach(r => {
          res[t] = res[t] === undefined ? {} : res[t]
          res[t][new Point(q, r)] = p[r]
        })
      })
    })
    return res
  }
}
window.f = new Field([1, "5B", 2, 3, "6B", 4, "7B"], [1, 0, 0, 0, 0, 0, 0])
