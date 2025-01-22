import { Color } from "./color"
import { Drawing } from "./drawing"

export class Project {
  #id: string
  #name: string
  #drawings: {[id:string]: Drawing}
  #palette: (Color | null)[]

  constructor(id?: string, name?: string, drawings?: Drawing[], palette?: (Color | null)[]) {
    this.#id = id ?? crypto.randomUUID()
    this.#name = name ?? "New project"
    this.#drawings = drawings ? Object.fromEntries(drawings.map(d => [d.id, d])) : {}
    this.#palette = [...palette ?? []]
  }

  get id() {
    return this.#id
  }

  get name() {
    return this.#name
  }

  get nameToDownload() {
    return this.#name + ".json"
  }

  rename(newName: string) {
    this.#name = newName
  }

  get drawings() {
    return {...this.#drawings}
  }

  getUniqueDrawingName(baseName?: string) {
    baseName = baseName ?? "New drawing"
    let name = baseName
    let i = 2
    while (true) {
      if (Object.values(this.#drawings).every(d => d.name !== name)) {
        return name
      }
      name = `${baseName} (${i})`
      i++
    }
  }

  addDrawing(drawing: Drawing) {
    this.#drawings[drawing.id] = drawing
  }

  getDrawing(drawingId: string): Drawing {
    const drawing = this.#drawings[drawingId]
    if (!drawing) {
      throw new Error(`Invalid drawing id: ${drawingId}`)
    }
    return drawing
  }

  deleteDrawing(drawingId: string) {
    delete this.#drawings[drawingId]
  }

  get palette() {
    return [...this.#palette]
  }

  setPalette(index: number, color: Color | null) {
    while (this.#palette.length <= index) {
      this.#palette.push(null)
    }
    this.#palette[index] = color
    while (this.#palette.length > 0 && this.#palette[this.#palette.length - 1] === null) {
      this.#palette = this.#palette.slice(0, this.#palette.length - 1)
    }
  }

  clone() {
    return new Project(this.#id, this.#name, Object.values(this.#drawings), this.#palette)
  }

  toJSON() {
    const drawings = Object.values(this.#drawings)
    drawings.sort((a, b) => a.id.localeCompare(b.id))

    return {
      id: this.#id,
      name: this.#name,
      drawings: drawings,
      palette: this.#palette,
    }
  }

  static fromJSON(json: unknown) {
    if (typeof json !== "object" || json === null) {
      throw new Error(`Invalid project data: expected=object, got=${json !== null ? typeof json : json}`)
    }
    if (!("id" in json)) {
      throw new Error("Missing required property 'id'")
    }
    if (typeof json.id !== "string") {
      throw new Error(`Invalid project id: expected=string, got=${typeof json.id}`)
    }
    if (!("name" in json)) {
      throw new Error("Missing required property 'name'")
    }
    if (typeof json.name !== "string") {
      throw new Error(`Invalid project name: expected=string, got=${typeof json.name}`)
    }
    if (!("drawings" in json) || !Array.isArray(json.drawings)) {
      throw new Error(`Invalid project drawings: not an array`)
    }
    if (!("palette" in json) || !Array.isArray(json.palette)) {
      throw new Error(`Invalid project palette: not an array`)
    }

    const drawings = (json.drawings as unknown[]).map(d => Drawing.fromJSON(d))
    const palette = (json.palette as unknown[]).map(c => c !== null ? Color.fromJSON(c) : null)
    return new Project(json.id, json.name, drawings, palette)
  }
}
