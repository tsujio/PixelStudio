import Drawing from "tsx!lib/drawing"

export default class Project {
  _drawings: Drawing[]

  constructor() {
    this._drawings = []
  }

  static create(): Project {
    const p = new Project()
    p._drawings.push(Drawing.create("New drawing", 48, 64))
    return p
  }

  get drawings(): Drawing[] {
    return [...this._drawings]
  }

  getDrawing(id: string): Drawing {
    const d = this._drawings.find(d => d.id === id)
    if (!d) {
      throw new Error(`Drawing (id=${id}) not found`)
    }
    return d
  }

  addDrawing(drawing: Drawing) {
    this._drawings.push(drawing)
  }

  clone(): Project {
    return Object.assign(new Project(), this)
  }
}
