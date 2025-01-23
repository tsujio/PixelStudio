import React, { createContext, useContext, useMemo, useEffect, useReducer } from 'react'
import { Project } from '../lib/project'
import { Color } from "../lib/color"
import { Drawing, DrawingDataPixel, DrawingDataPosition, DrawingDataRect } from "../lib/drawing"

type ProjectContextValue = {
  project: Project
  updateProject: (action: Action) => void
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

type Action =
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
    position: DrawingDataPosition
    color: DrawingDataPixel
    chainId: string
  } |
  {
    type: "trimDrawing"
    drawingId: string
    rect: DrawingDataRect
  } |
  {
    type: "resizeDrawing"
    drawingId: string
    rect: DrawingDataRect
  } |
  {
    type: "setPixelSize"
    drawingId: string
    pixelSize: number
  } |
  {
    type: "setPalette"
    index: number
    color: Color | null
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
    action: Action
  }[]
}

const reducer = (projectState: ProjectHistory, action: Action): ProjectHistory => {
  const { current, history } = projectState
  const project = history[current].project
  switch (action.type) {
    case "newProject": {
      const pjt = new Project()
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
      const modified = drawing.setPixel(action.position, action.color)
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
      const { start, end } = action.rect
      const top = Math.min(start.rowIndex, end.rowIndex)
      const left = Math.min(start.columnIndex, end.columnIndex)
      const bottom = Math.max(start.rowIndex, end.rowIndex)
      const right = Math.max(start.columnIndex, end.columnIndex)

      const pjt = project.clone()
      const drawing = pjt.getDrawing(action.drawingId).clone()
      drawing.trim({start: {rowIndex: top, columnIndex: left}, end: {rowIndex: bottom, columnIndex: right}})
      pjt.addDrawing(drawing)
      return {current: current + 1, history: [...history.slice(0, current + 1), {project: pjt, action}]}
    }
    case "resizeDrawing": {
      const pjt = project.clone()
      const drawing = pjt.getDrawing(action.drawingId).clone()
      drawing.resize(action.rect)
      pjt.addDrawing(drawing)
      return {current: current + 1, history: [...history.slice(0, current + 1), {project: pjt, action}]}
    }
    case "setPixelSize": {
      const pjt = project.clone()
      const drawing = pjt.getDrawing(action.drawingId).clone()
      drawing.setPixelSize(action.pixelSize)
      pjt.addDrawing(drawing)
      return {current: current + 1, history: [...history.slice(0, current + 1), {project: pjt, action}]}
    }
    case "setPalette": {
      const pjt = project.clone()
      pjt.setPalette(action.index, action.color)
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

const initialProject = (() => {
  const dummy: ProjectHistory = {current: 0, history: [{project: new Project(), action: {type: "newProject"}}]}

  const dump = localStorage.getItem("project")
  if (dump !== null) {
    try {
      const json = JSON.parse(dump)
      return reducer(dummy, {type: "load", json})
    } catch (e) {
      console.warn("Failed to load project from localStorage", e, dump)
    }
  }

  return reducer(dummy, {type: "newProject"})
})()

type Props = {
  children: React.ReactNode
}

export const ProjectContextProvider = (props: Props) => {
  const [{current, history}, updateProject] = useReducer(reducer, initialProject)
  const project = history[current].project

  useEffect(() => {
    const dump = JSON.stringify(project)
    localStorage.setItem("project", dump)
  }, [project])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "KeyZ") {
        if (e.shiftKey) {
          updateProject({type: "redo"})
        } else {
          updateProject({type: "undo"})
        }
      }

      if (e.ctrlKey && e.code === "KeyY") {
        updateProject({type: "redo"})
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  const contextValue = useMemo(() => ({
    project,
    updateProject,
  }), [project])

  return (
    <ProjectContext.Provider value={contextValue}>
      {props.children}
    </ProjectContext.Provider>
  )
}

export const useProjectContext = () => {
  const value = useContext(ProjectContext)
  if (value === null) {
    throw new Error("Not in a project context")
  }
  return value
}
