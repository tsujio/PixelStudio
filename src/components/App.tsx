import { useReducer, useState } from 'react'
import { ProjectContextProvider } from './ProjectContext'
import { Sidebar } from './SideBar'
import { Main } from './Main'
import { WindowSystemContextProvider } from './WindowSystem'
import { Project, updateProjectReducer } from '../lib/project'
import { DrawContextProvider } from './DrawContext'

export function App() {
  const [project, updateProject] = useReducer(updateProjectReducer, undefined, () =>
    updateProjectReducer(new Project(""), {type: "newProject"})
  )

  const [sidebarWidth, setSidebarWidth] = useState(250)

  const onSidebarResize = (width: number) => {
    if (width > 150 && width < document.body.clientWidth - 50) {
      setSidebarWidth(width)
    }
  }

  return (
    <>
      <WindowSystemContextProvider>
        <DrawContextProvider>
          <ProjectContextProvider project={project} updateProject={updateProject}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `${sidebarWidth}px 1fr`,
                height: "100%",
              }}
            >
              <Sidebar
                onResize={onSidebarResize}
              />
              <Main />
            </div>
          </ProjectContextProvider>
        </DrawContextProvider>
      </WindowSystemContextProvider>
    </>
  )
}
