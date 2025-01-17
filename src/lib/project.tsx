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

  clone() {
    const pjt = new Project(this.name)
    pjt.#drawings = {...this.drawings}
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
    color: Color | null
    chainId: string
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
  } |
  {
    type: "resizeDrawing"
    drawingId: string
    start: {
      rowIndex: number
      columnIndex: number
    }
    end: {
      rowIndex: number
      columnIndex: number
    }
  } |
  {
    type: "undo"
  } |
  {
    type: "redo"
  }

type ProjectHistory = {
  current: number
  history: {
    project: Project
    action: UpdateProjectAction
  }[]
}

export const updateProjectReducer = (projectState: ProjectHistory, action: UpdateProjectAction): ProjectHistory => {
  const { current, history } = projectState
  const project = history[current].project
  switch (action.type) {
    case "newProject": {
      const pjt = new Project("New project")
      const drawing = Drawing.create(pjt.getUniqueDrawingName())
      pjt.addDrawing(drawing)
      return {current: 0, history: [{project: pjt, action}]}
    }
    case "load": {
      const pjt = Project.fromJSON(action.json)
      return {current: 0, history: [{project: pjt, action}]}
    }
    case "rename": {
      const pjt = project.clone()
      pjt.rename(action.newName)
      return {current: current + 1, history: [...history.slice(0, current + 1), {project: pjt, action}]}
    }
    case "addDrawing": {
      const pjt = project.clone()
      const drawing = Drawing.create(pjt.getUniqueDrawingName())
      pjt.addDrawing(drawing)
      return {current: current + 1, history: [...history.slice(0, current + 1), {project: pjt, action}]}
    }
    case "renameDrawing": {
      const pjt = project.clone()
      const drawing = pjt.getDrawing(action.drawingId).clone()
      drawing.rename(pjt.getUniqueDrawingName(action.newName))
      pjt.addDrawing(drawing)
      return {current: current + 1, history: [...history.slice(0, current + 1), {project: pjt, action}]}
    }
    case "deleteDrawing": {
      const pjt = project.clone()
      pjt.deleteDrawing(action.drawingId)
      return {current: current + 1, history: [...history.slice(0, current + 1), {project: pjt, action}]}
    }
    case "setPixel": {
      const pjt = project.clone()
      const drawing = pjt.getDrawing(action.drawingId).clone()
      const modified = drawing.setPixel(action.rowIndex, action.columnIndex, action.color)
      if (!modified) {
        return projectState
      }
      pjt.addDrawing(drawing)

      const prevAction = history.length > 0 ? history[current].action : null
      if (prevAction !== null && prevAction.type === "setPixel" && prevAction.chainId === action.chainId) {
        return {current, history: [...history.slice(0, current), {project: pjt, action}]}
      } else {
        return {current: current + 1, history: [...history.slice(0, current + 1), {project: pjt, action}]}
      }
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
      return {current: current + 1, history: [...history.slice(0, current + 1), {project: pjt, action}]}
    }
    case "resizeDrawing": {
      const pjt = project.clone()
      const drawing = pjt.getDrawing(action.drawingId).clone()
      drawing.resize(action.start, action.end)
      pjt.addDrawing(drawing)
      return {current: current + 1, history: [...history.slice(0, current + 1), {project: pjt, action}]}
    }
    case "undo": {
      if (current > 0) {
        return {current: current - 1, history}
      } else {
        return projectState
      }
    }
    case "redo": {
      if (current < history.length - 1) {
        return {current: current + 1, history}
      } else {
        return projectState
      }
    }
  }
}

export const initialProject = (() => {
  const seed: ProjectHistory = {current: 0, history: [{project: new Project(""), action: {type: "newProject"}}]}

  const dump = localStorage.getItem("project")
  if (dump !== null) {
    try {
      const json = JSON.parse(dump)
      return updateProjectReducer(seed, {type: "load", json})
    } catch (e) {
      console.warn("Failed to load project from localStorage", e, dump)
    }
  }

  return updateProjectReducer(seed, {type: "newProject"})
})()
