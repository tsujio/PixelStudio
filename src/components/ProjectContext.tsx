import React, { createContext, useContext, useMemo } from 'react'
import { Project, UpdateProjectAction } from '../lib/project'

type ProjectContextValue = {
  project: Project
  updateProject: (action: UpdateProjectAction) => void
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

type Props = {
  project: Project
  updateProject: (action: UpdateProjectAction) => void
  children: React.ReactNode
}

export const ProjectContextProvider = (props: Props) => {
  const contextValue = useMemo(() => ({
    project: props.project,
    updateProject: props.updateProject,
  }), [props.project, props.updateProject])

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
