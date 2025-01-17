import { useEffect } from "react"
import { useProjectContext } from "./ProjectContext"
import { useWindowSystemContext } from "./WindowSystem"
import { Window } from "./Window"
import { Drawing } from "./Drawing"
import { ToolBox } from "./ToolBox"

export function Main() {
  const { windows, openWindow, closeWindow } = useWindowSystemContext()

  const { project } = useProjectContext()

  useEffect(() => {
    const windowId = openWindow(0, 500, {type: "toolBox"})
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
