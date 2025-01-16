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

  return (
    <>
      {Object.entries(windows).filter(([_, w]) => w.metadata.type === "drawing").map(([windowId, window]) =>
        <Window
          key={windowId}
          id={windowId}
          top={window.top}
          left={window.left}
          zIndex={window.zIndex}
        >
          {window.metadata.type === "drawing" && window.metadata.drawingId in project.drawings ?
          <Drawing
            drawing={project.drawings[window.metadata.drawingId]}
          /> :
          null}
        </Window>
      )}
      {Object.entries(windows).filter(([_, w]) => w.metadata.type === "toolBox").map(([windowId, window]) =>
        <Window
          key={windowId}
          id={windowId}
          top={window.top}
          left={window.left}
          zIndex={window.zIndex}
        >
          <ToolBox />
        </Window>
      )}
    </>
  )
}
