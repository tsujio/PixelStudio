import React, { createContext, useContext, useMemo, useEffect, useReducer } from 'react'
import { Project } from '../lib/project'
import { Color } from "../lib/color"
import { Drawing, DrawingDataPixel, DrawingDataPosition, DrawingDataRect } from "../lib/drawing"
import { DrawingPanel } from '../lib/panel'

type ProjectContextValue = {
  project: Project
  projectHistory: ProjectHistory
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
    type: "copyDrawing"
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
    type: "openPanel"
    drawingId: string
    x: number
    y: number
  } |
  {
    type: "closePanel"
    panelId: string
  } |
  {
    type: "setPanelZ"
    panelId: string
    offset: number
  } |
  {
    type: "movePanel"
    panelId: string
    x: number
    y: number
    chainId?: string
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

const reducer = (projectHistory: ProjectHistory, action: Action): ProjectHistory => {
  const { current, history } = projectHistory

  const pushHistory = (project: Project, replace?: boolean) => {
    if (replace) {
      return {current, history: [...history.slice(0, current), {project, action}]}
    } else {
      return {
        current: current + 1,
        history: [...history.slice(0, current + 1), {project, action}],
      }
    }
  }

  const project = history[current].project
  switch (action.type) {
    case "newProject": {
      const pjt = new Project()
      const drawing = Drawing.create(pjt.getUniqueDrawingName())
      pjt.addDrawing(drawing)
      pjt.openDrawingPanel(drawing.id, 0, 0)
      return {current: 0, history: [{project: pjt, action}]}
    }
    case "load": {
      const pjt = Project.fromJSON(action.json)
      return {current: 0, history: [{project: pjt, action}]}
    }
    case "rename": {
      const pjt = project.clone()
      if (pjt.name === action.newName) {
        return projectHistory
      }
      pjt.rename(action.newName)
      return pushHistory(pjt)
    }
    case "addDrawing": {
      const pjt = project.clone()
      const drawing = Drawing.create(pjt.getUniqueDrawingName())
      pjt.addDrawing(drawing)
      return pushHistory(pjt)
    }
    case "renameDrawing": {
      const pjt = project.clone()
      const drawing = pjt.getDrawing(action.drawingId).clone()
      if (drawing.name === action.newName) {
        return projectHistory
      }
      drawing.rename(pjt.getUniqueDrawingName(action.newName))
      pjt.addDrawing(drawing)
      return pushHistory(pjt)
    }
    case "deleteDrawing": {
      const pjt = project.clone()
      pjt.deleteDrawing(action.drawingId)
      return pushHistory(pjt)
    }
    case "copyDrawing": {
      const pjt = project.clone()
      const src = pjt.getDrawing(action.drawingId).clone()
      const tmp = Drawing.create(pjt.getUniqueDrawingName(src.name))
      const dest = new Drawing(tmp.id, tmp.name, src.data, src.pixelSize)
      pjt.addDrawing(dest)
      return pushHistory(pjt)
    }
    case "setPixel": {
      const pjt = project.clone()
      const drawing = pjt.getDrawing(action.drawingId).clone()
      const modified = drawing.setPixel(action.position, action.color)
      if (!modified) {
        return projectHistory
      }
      pjt.addDrawing(drawing)

      const prevAction = history.length > 0 ? history[current].action : null
      if (prevAction !== null && prevAction.type === "setPixel" && prevAction.chainId === action.chainId) {
        return pushHistory(pjt, true)
      } else {
        return pushHistory(pjt)
      }
    }
    case "resizeDrawing": {
      const pjt = project.clone()
      const drawing = pjt.getDrawing(action.drawingId).clone()
      const modified = drawing.resize(action.rect)
      if (!modified) {
        return projectHistory
      }
      pjt.addDrawing(drawing)

      const panel = pjt.panels.find(p => p instanceof DrawingPanel && p.drawingId === action.drawingId)?.clone()
      if (panel) {
        panel.move(
          panel.x + action.rect.start.columnIndex * drawing.pixelSize,
          panel.y + action.rect.start.rowIndex * drawing.pixelSize,
        )
        pjt.replacePanel(panel)
      }

      return pushHistory(pjt)
    }
    case "setPixelSize": {
      const pjt = project.clone()
      const drawing = pjt.getDrawing(action.drawingId).clone()
      if (drawing.pixelSize === action.pixelSize) {
        return projectHistory
      }
      drawing.setPixelSize(action.pixelSize)
      pjt.addDrawing(drawing)
      return pushHistory(pjt)
    }
    case "setPalette": {
      const pjt = project.clone()
      const modified = pjt.setPalette(action.index, action.color)
      if (!modified) {
        return projectHistory
      }
      return pushHistory(pjt)
    }
    case "openPanel": {
      const pjt = project.clone()
      const panel = pjt.panels.find(p => p instanceof DrawingPanel && p.drawingId === action.drawingId)
      if (panel !== undefined) {
        return projectHistory
      }
      pjt.openDrawingPanel(action.drawingId, action.x, action.y)
      return pushHistory(pjt)
    }
    case "closePanel": {
      const pjt = project.clone()
      pjt.closePanel(action.panelId)
      return pushHistory(pjt)
    }
    case "setPanelZ": {
      const pjt = project.clone()
      const oldIndex = pjt.panels.findIndex(p => p.id === action.panelId)
      pjt.setPanelZ(action.panelId, action.offset)
      const newIndex = pjt.panels.findIndex(p => p.id === action.panelId)
      if (oldIndex === newIndex) {
        return projectHistory
      }
      return pushHistory(pjt)
    }
    case "movePanel": {
      const pjt = project.clone()
      const panel = pjt.getPanel(action.panelId).clone()
      if (panel.x === action.x && panel.y === action.y) {
        return projectHistory
      }
      panel.move(action.x, action.y)
      pjt.replacePanel(panel)

      const prevAction = history.length > 0 ? history[current].action : null
      if (prevAction !== null && prevAction.type === "movePanel" && action.chainId !== undefined && prevAction.chainId === action.chainId) {
        return pushHistory(pjt, true)
      } else {
        return pushHistory(pjt)
      }
    }
    case "undo": {
      if (current > 0) {
        return {current: current - 1, history}
      } else {
        return projectHistory
      }
    }
    case "redo": {
      if (current < history.length - 1) {
        return {current: current + 1, history}
      } else {
        return projectHistory
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
  const [projectHistory, updateProject] = useReducer(reducer, initialProject)
  const project = projectHistory.history[projectHistory.current].project

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
    projectHistory,
    updateProject,
  }), [project, projectHistory])

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
