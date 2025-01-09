import React, { createContext, useContext, useMemo } from 'react'
import Project from 'tsx!lib/project'

const ProjectContext = createContext(null)

type Props = {
  project: Project | null
  updateProject: (action: any) => void
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
  return useContext(ProjectContext)
}
