import { Color } from "./color"
import { Drawing } from "./drawing"
import { DrawingPanel, Panel } from "./panel"

export class Project {
  #id: string
  #name: string
  #drawings: {[id:string]: Drawing}
  #palette: (Color | null)[]
  #panels: Panel[]

  constructor(id?: string, name?: string, drawings?: Drawing[], palette?: (Color | null)[], panels?: Panel[]) {
    this.#id = id ?? crypto.randomUUID()
    this.#name = name ?? "New project"
    this.#drawings = drawings ? Object.fromEntries(drawings.map(d => [d.id, d])) : {}
    this.#palette = [...palette ?? []]
    this.#panels = [...panels ?? []]
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
    let modified = false
    while (this.#palette.length <= index) {
      this.#palette.push(null)
      modified = true
    }

    modified = this.#palette[index] !== color
    this.#palette[index] = color

    while (this.#palette.length > 0 && this.#palette[this.#palette.length - 1] === null) {
      this.#palette = this.#palette.slice(0, this.#palette.length - 1)
      modified = true
    }

    return modified
  }

  get panels() {
    return [...this.#panels]
  }

  openDrawingPanel(drawingId: string, x: number, y: number) {
    if (this.#panels.some(p => p instanceof DrawingPanel && p.drawingId === drawingId)) {
      throw new Error(`Drawing panel with drawingId=${drawingId} is already open`)
    }

    const panel = new DrawingPanel(crypto.randomUUID(), x, y, drawingId)
    this.#panels.push(panel)

    return panel
  }

  closePanel(panelId: string) {
    const index = this.#panels.findIndex(p => p.id === panelId)
    if (index === -1) {
      throw new Error(`Invalid panel id: ${panelId}`)
    }
    this.#panels.splice(index, 1)
  }

  getPanel(panelId: string) {
    const panel = this.#panels.find(p => p.id === panelId)
    if (panel === undefined) {
      throw new Error(`Invalid panel id: ${panelId}`)
    }
    return panel
  }

  getActivePanel() {
    return this.#panels.length > 0 ? this.#panels[this.#panels.length - 1] : undefined
  }

  getDrawingPanel(drawingId: string) {
    return this.#panels.find(p => p instanceof DrawingPanel && p.drawingId === drawingId)
  }

  replacePanel(panel: Panel) {
    const index = this.#panels.findIndex(p => p.id === panel.id)
    if (index === -1) {
      throw new Error(`Invalid panel id: ${panel.id}`)
    }
    this.#panels[index] = panel
  }

  setPanelZ(panelId: string, offset: number) {
    const index = this.#panels.findIndex(p => p.id === panelId)
    if (index === -1) {
      throw new Error(`Invalid panel id: ${panelId}`)
    }
    const panel = this.#panels[index]
    const front = this.#panels.filter((_, i) => i <= index + offset + (offset < 0 ? -1 : 0)).filter(p => p.id !== panel.id)
    const back = this.#panels.filter((_, i) => i > index + offset + (offset < 0 ? -1 : 0)).filter(p => p.id !== panel.id)
    this.#panels = front.concat([panel]).concat(back)
  }

  clone() {
    return new Project(this.#id, this.#name, Object.values(this.#drawings), [...this.#palette], [...this.#panels])
  }

  toJSON() {
    const drawings = Object.values(this.#drawings)
    drawings.sort((a, b) => a.id.localeCompare(b.id))

    return {
      id: this.#id,
      name: this.#name,
      drawings: drawings,
      palette: this.#palette,
      panels: this.#panels,
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
    if (!("panels" in json) || !Array.isArray(json.panels)) {
      throw new Error(`Invalid project panels: not an array`)
    }

    const drawings = (json.drawings as unknown[]).map(d => Drawing.fromJSON(d))
    const palette = (json.palette as unknown[]).map(c => c !== null ? Color.fromJSON(c) : null)
    const panels = (json.panels as unknown[]).map(p => Panel.fromJSON(p))
    return new Project(json.id, json.name, drawings, palette, panels)
  }
}
