import { ProjectContextProvider } from './ProjectContext'
import { Sidebar } from './Sidebar'
import { DrawContextProvider } from './DrawContext'
import { Board } from './Board'

document.documentElement.style.overscrollBehavior = "none"
document.documentElement.style.touchAction = "none"

export function App() {
  return (
    <>
      <DrawContextProvider>
        <ProjectContextProvider>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `auto 1fr`,
              gridTemplateRows: "minmax(0, 1fr)",
              height: "100%",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Sidebar />
            <Board />
          </div>
        </ProjectContextProvider>
      </DrawContextProvider>
    </>
  )
}
