import { useProjectContext } from "./ProjectContext"
import { useWindowSystemContext } from "./WindowSystem"
import { Window } from "./Window"
import { Drawing } from "./Drawing"
import { makeDragStartCallback } from "../lib/drag"
import { useRef, useState } from "react"

export function Main() {
  const { windows, moveWindow } = useWindowSystemContext()

  const { project } = useProjectContext()

  const [dragging, setDragging] = useState(false)
  const windowPositionsOnDragStartRef = useRef<{[windowId: string]: [number, number]}>({})
  const onMouseDown = makeDragStartCallback((e: React.MouseEvent) => {
    const [x, y] = [e.pageX, e.pageY]
    windowPositionsOnDragStartRef.current = Object.fromEntries(Object.values(windows).map(w => [w.windowId, [w.top, w.left]]))

    const onDragging = (e: MouseEvent) => {
      const [diffX, diffY] = [e.pageX - x, e.pageY - y]
      Object.entries(windowPositionsOnDragStartRef.current).forEach(([windowId, [top, left]]) => {
        moveWindow(windowId, top + diffY, left + diffX)
      })
    }

    const onDragEnd = () => {
      setDragging(false)
    }

    setDragging(true)

    return {onDragging, onDragEnd}
  })

  const drawingWindows = Object.values(windows).filter(w => w.metadata.type === "drawing" && w.metadata.drawingId in project.drawings)

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        cursor: dragging ? "grabbing" : "inherit",
      }}
    >
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
    </div>
  )
}
