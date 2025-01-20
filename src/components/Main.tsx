import { useEffect } from "react"
import { useProjectContext } from "./ProjectContext"
import { useWindowSystemContext } from "./WindowSystem"
import { Window, windowSidePadding } from "./Window"
import { Drawing } from "./Drawing"
import { ToolBox, toolBoxWidth } from "./ToolBox"

const initialWindowWidth = window.innerWidth

export function Main() {
  const { windows, openWindow, closeWindow } = useWindowSystemContext()

  const { project } = useProjectContext()

  useEffect(() => {
    const left = initialWindowWidth - toolBoxWidth - windowSidePadding * 2
    const windowId = openWindow(0, left, {type: "toolBox"})
    return () => {
      closeWindow(windowId)
    }
  }, [openWindow, closeWindow])

  const drawingWindows = Object.values(windows).filter(w => w.metadata.type === "drawing" && w.metadata.drawingId in project.drawings)
  const toolBoxWindow = Object.values(windows).find((w) => w.metadata.type === "toolBox")

  return (
    <>
      {drawingWindows.map(window =>
        <Window
          key={window.windowId}
          id={window.windowId}
          top={window.top}
          left={window.left}
          zIndex={window.zIndex}
        >
          {window.metadata.type === "drawing" &&
          <Drawing
            drawing={project.drawings[window.metadata.drawingId]}
          />}
        </Window>
      )}
      {toolBoxWindow &&
      <Window
        key={toolBoxWindow.windowId}
        id={toolBoxWindow.windowId}
        top={toolBoxWindow.top}
        left={toolBoxWindow.left}
        zIndex={toolBoxWindow.zIndex}
      >
        <ToolBox />
      </Window>}
    </>
  )
}
