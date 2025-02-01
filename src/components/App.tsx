import { ProjectContextProvider } from './ProjectContext'
import { Sidebar } from './Sidebar'
import { DrawContextProvider } from './DrawContext'
import { Board } from './Board'
import { GestureContextProvider } from './GestureContext'
import { WindowContextProvider } from './WindowContext'
import { BoardContextProvider } from './BoardContext'
import { useState } from 'react'

document.documentElement.style.overscrollBehavior = "none"
document.documentElement.style.touchAction = "none"

if (!("randomUUID" in crypto)) {
  Object.defineProperty(crypto, "randomUUID", {
    value: () => Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => (b < 16 ? "0" : "") + b.toString(16))
      .reduce((acc, cur, i) => acc + ([4, 6, 8, 10].includes(i) ? "-" : "") + cur)
  })
}

export function App() {
  const [sidebarWidth, setSidebarWidth] = useState(0)

  return (
    <>
      <WindowContextProvider>
        <GestureContextProvider>
          <BoardContextProvider>
            <DrawContextProvider>
              <ProjectContextProvider>
                <Sidebar width={sidebarWidth} onWidthChange={setSidebarWidth} />
                <Board sidebarWidth={sidebarWidth} />
              </ProjectContextProvider>
            </DrawContextProvider>
          </BoardContextProvider>
        </GestureContextProvider>
      </WindowContextProvider>
    </>
  )
}
