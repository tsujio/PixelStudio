import { useReducer, useState, useEffect } from 'react'
import { ProjectContextProvider } from './ProjectContext'
import { Sidebar } from './Sidebar'
import { Main } from './Main'
import { WindowSystemContextProvider } from './WindowSystem'
import { updateProjectReducer, initialProject } from '../lib/project'
import { DrawContextProvider } from './DrawContext'

export function App() {
  const [{current, history}, updateProject] = useReducer(updateProjectReducer, initialProject)
  const project = history[current].project

  const [sidebarWidth, setSidebarWidth] = useState(250)

  const onSidebarResize = (width: number) => {
    if (width > 150 && width < document.body.clientWidth - 50) {
      setSidebarWidth(width)
    }
  }

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
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [])

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
