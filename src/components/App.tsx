import { ProjectContextProvider } from './ProjectContext'
import { Sidebar } from './Sidebar'
import { DrawContextProvider } from './DrawContext'
import { Board } from './Board'
import { GestureContextProvider } from './GestureContext'

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
  return (
    <>
      <GestureContextProvider>
        <DrawContextProvider>
          <ProjectContextProvider>
            <Sidebar />
            <Board />
          </ProjectContextProvider>
        </DrawContextProvider>
      </GestureContextProvider>
    </>
  )
}
