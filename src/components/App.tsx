import { useState } from 'react'
import { ProjectContextProvider } from './ProjectContext'
import { Sidebar } from './Sidebar'
import { Main } from './Main'
import { WindowSystemContextProvider } from './WindowSystem'
import { DrawContextProvider } from './DrawContext'

export function App() {
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
          <ProjectContextProvider>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `${sidebarWidth}px 1fr`,
                gridTemplateRows: "minmax(0, 1fr)",
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
