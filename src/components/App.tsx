import { ProjectContextProvider } from './ProjectContext'
import { Sidebar } from './Sidebar'
import { Main } from './Main'
import { WindowSystemContextProvider } from './WindowSystem'
import { DrawContextProvider } from './DrawContext'
import { ToolBox } from './ToolBox'

// Prevent scroll, zoom, and swipe refresh on mobile devices.
//document.addEventListener("touchmove", e => { e.preventDefault() }, { passive: false })

document.documentElement.style.overscrollBehavior = "none"
document.documentElement.style.touchAction = "none"

export function App() {
  return (
    <>
      <WindowSystemContextProvider>
        <DrawContextProvider>
          <ProjectContextProvider>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `auto 1fr auto`,
                gridTemplateRows: "minmax(0, 1fr)",
                height: "100%",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Sidebar />
              <Main />
              <ToolBox />
            </div>
          </ProjectContextProvider>
        </DrawContextProvider>
      </WindowSystemContextProvider>
    </>
  )
}
