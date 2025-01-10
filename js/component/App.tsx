import React, { useState, useReducer } from 'react'
import NavigationBar from 'tsx!component/NavigationBar'
import Project from 'tsx!lib/project'
import { ProjectContextProvider } from 'tsx!component/ProjectContext'
import { DrawContextProvider } from 'tsx!component/DrawContext'
import ProjectComponent from 'tsx!component/Project'

const reducer = (project: Project, action: any): Project => {
  switch (action.type) {
    case 'setPixel': {
      const { drawingId, rowIndex, columnIndex, color } = action
      const drawing = project.getDrawing(drawingId)
      const modified = drawing.setPixel(rowIndex, columnIndex, color)
      return modified ? project.clone() : project
    }
    case 'trimDrawing': {
      const { drawingId, top, left, bottom, right } = action
      const drawing = project.getDrawing(drawingId)
      drawing.trim({rowIndex: top, columnIndex: left}, {rowIndex: bottom, columnIndex: right})
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

  const [saving, setSaving] = useState<boolean>(false)

  const onSaveButtonClick = () => {
    if (!saving) {
      setSaving(true)
    }
  }

  const onDataURLGenerate = (url: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = "foo.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setSaving(false)
  }

  return <>
    <NavigationBar
      onSaveButtonClick={onSaveButtonClick}
    />
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
