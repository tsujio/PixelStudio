import React, { useState, useReducer } from 'react'
import NavigationBar from 'tsx!component/NavigationBar'
import Project from 'tsx!lib/project'
import Drawing from 'tsx!lib/drawing'
import { ProjectContextProvider } from 'tsx!component/ProjectContext'
import { DrawContextProvider } from 'tsx!component/DrawContext'
import ProjectComponent from 'tsx!component/Project'

const reducer = (project: Project, action: any): Project => {
  switch (action.type) {
    case 'load': {
      const { json } = action
      return Project.fromJSON(json)
    }
    case 'createDrawing': {
      const drawing = Drawing.create("New drawing", 48, 64)
      project.addDrawing(drawing)
      return project.clone()
    }
    case 'setPixel': {
      const { drawingId, rowIndex, columnIndex, color } = action
      const drawing = project.getDrawing(drawingId)
      const modified = drawing.setPixel(rowIndex, columnIndex, color)
      return modified ? project.clone() : project
    }
    case 'clearPixel': {
      const { drawingId, rowIndex, columnIndex } = action
      const drawing = project.getDrawing(drawingId)
      const modified = drawing.clearPixel(rowIndex, columnIndex)
      return modified ? project.clone() : project
    }
    case 'trimDrawing': {
      const { drawingId, top, left, bottom, right } = action
      const drawing = project.getDrawing(drawingId)
      drawing.trim({rowIndex: top, columnIndex: left}, {rowIndex: bottom, columnIndex: right})
      return project.clone()
    }
    case 'renameDrawing': {
      const { drawingId, name } = action
      const drawing = project.getDrawing(drawingId)
      drawing.rename(name)
      return project.clone()
    }
    case 'deleteDrawing': {
      const { drawingId } = action
      project.deleteDrawing(drawingId)
      return project.clone()
    }
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

export default function App() {
  const [project, updateProject] = useReducer<Project|null>(reducer, undefined, () => {
    return Project.create()
  })

  const onSaveButtonClick = () => {
    const json = JSON.stringify(project, null, 2)
    const blob = new Blob([json], {type: "application/json"})
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "project.json"
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    a.remove()
  }

  const onOpenButtonClick = (e: any) => {
    const files = e.target.files
    if (files.length > 0) {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          const json = JSON.parse(reader.result.toString())
          updateProject({type: "load", json})
        }
      }
      reader.readAsText(files[0])
    }
  }

  return <>
    <NavigationBar
      onSaveButtonClick={onSaveButtonClick}
    />
    <input type="file" onChange={onOpenButtonClick} />
    <ProjectContextProvider
      project={project}
      updateProject={updateProject}
    >
      <DrawContextProvider>
        {project && <ProjectComponent />}
      </DrawContextProvider>
    </ProjectContextProvider>
  </>
}
