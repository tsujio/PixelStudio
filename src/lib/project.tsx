import { Drawing } from "./drawing"
import { Color } from "./color"

export class Project {
  #name: string
  #drawings: {[id:string]: Drawing}

  constructor(name: string) {
    this.#name = name
    this.#drawings = {}
  }

  get name() {
    return this.#name
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
    this.#drawings = {
      ...this.#drawings,
      [drawing.id]: drawing,
    }
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

  clone() {
    const pjt = new Project(this.name)
    pjt.#drawings = this.drawings
    return pjt
  }

  toJSON() {
    const drawings = Object.values(this.#drawings)
    drawings.sort((a, b) => a.id.localeCompare(b.id))

    return {
      name: this.#name,
      drawings: drawings,
    }
  }

  static fromJSON(json: unknown) {
    if (typeof json !== "object" || json === null) {
      throw new Error(`Invalid project data: expected=object, got=${json !== null ? typeof json : json}`)
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

    const pjt = new Project(json.name as string)
    const drawings = (json.drawings as unknown[]).map(d => Drawing.fromJSON(d))
    pjt.#drawings = Object.fromEntries(drawings.map(d => [d.id, d]))
    return pjt
  }
}

export type UpdateProjectAction =
  {
    type: "newProject"
  } |
  {
    type: "load"
    json: unknown
  } |
  {
    type: "rename"
    newName: string
  } |
  {
    type: "addDrawing"
  } |
  {
    type: "renameDrawing"
    drawingId: string
    newName: string
  } |
  {
    type: "deleteDrawing"
    drawingId: string
  } |
  {
    type: "setPixel"
    drawingId: string
    rowIndex: number
    columnIndex: number
    color: Color
    chain?: boolean
  } |
  {
    type: "clearPixel"
    drawingId: string
    rowIndex: number
    columnIndex: number
    chain?: boolean
  } |
  {
    type: "trimDrawing"
    drawingId: string
    start: {
      rowIndex: number
      columnIndex: number
    }
    end: {
      rowIndex: number
      columnIndex: number
    }
  }

export const updateProjectReducer = (project: Project, action: UpdateProjectAction): Project => {
  switch (action.type) {
    case "newProject": {
      const project = new Project("New project")
      const drawing = Drawing.create(project.getUniqueDrawingName())
      project.addDrawing(drawing)
      return project
    }
    case "load": {
      return Project.fromJSON(action.json)
    }
    case "rename": {
      const pjt = project.clone()
      pjt.rename(action.newName)
      return pjt
    }
    case "addDrawing": {
      const pjt = project.clone()
      const drawing = Drawing.create(pjt.getUniqueDrawingName())
      pjt.addDrawing(drawing)
      return pjt
    }
    case "renameDrawing": {
      const pjt = project.clone()
      const drawing = pjt.getDrawing(action.drawingId).clone()
      drawing.rename(pjt.getUniqueDrawingName(action.newName))
      pjt.addDrawing(drawing)
      return pjt
    }
    case "deleteDrawing": {
      const pjt = project.clone()
      pjt.deleteDrawing(action.drawingId)
      return pjt
    }
    case "setPixel":
    case "clearPixel": {
      const pjt = project.clone()
      const drawing = pjt.getDrawing(action.drawingId).clone()
      const color = action.type === "setPixel" ? action.color : null
      drawing.setPixel(action.rowIndex, action.columnIndex, color)
      pjt.addDrawing(drawing)
      return pjt
    }
    case "trimDrawing": {
      const { start, end } = action
      const top = Math.min(start.rowIndex, end.rowIndex)
      const left = Math.min(start.columnIndex, end.columnIndex)
      const bottom = Math.max(start.rowIndex, end.rowIndex)
      const right = Math.max(start.columnIndex, end.columnIndex)

      const pjt = project.clone()
      const drawing = pjt.getDrawing(action.drawingId).clone()
      drawing.trim({rowIndex: top, columnIndex: left}, {rowIndex: bottom, columnIndex: right})
      pjt.addDrawing(drawing)
      return pjt
    }
  }
}
