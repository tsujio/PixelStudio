import { useProjectContext } from "./ProjectContext"
import { useWindowSystemContext } from "./WindowSystem"
import { Window } from "./Window"
import { Drawing } from "./Drawing"
import { useGesture } from "../lib/drag"
import { useState } from "react"

const backgroundGridSize = 42

export function Main() {
  const { windows, moveWindow } = useWindowSystemContext()

  const { project } = useProjectContext()

  const [backgroundPositionOffset, setBackgroundPositionOffset] = useState<[number, number]>([0, 0])

  const [dragging, setDragging] = useState(false)
  const onPointerDown = useGesture((e: React.PointerEvent) => {
    const [x, y] = [e.pageX, e.pageY]

    const onDragMove = (e: PointerEvent) => {
      const [diffX, diffY] = [e.pageX - x, e.pageY - y]
      Object.values(windows).forEach(w => {
        moveWindow(w.windowId, w.top + diffY, w.left + diffX)
      })

      setBackgroundPositionOffset([
        (backgroundPositionOffset[0] + diffX) % backgroundGridSize,
        (backgroundPositionOffset[1] + diffY) % backgroundGridSize,
      ])
    }

    const onDragEnd = () => {
      setDragging(false)
    }

    let prevDistanceSq = -1
    const onPinchStart = (e1: PointerEvent, e2: PointerEvent) => {
      prevDistanceSq = Math.pow(e1.pageX - e2.pageX, 2) + Math.pow(e1.pageY - e2.pageY, 2)
    }

    const onPinchMove = (e1: PointerEvent, e2: PointerEvent) => {
      const distanceSq = Math.pow(e1.pageX - e2.pageX, 2) + Math.pow(e1.pageY - e2.pageY, 2)
      const diff = distanceSq - prevDistanceSq
      prevDistanceSq = distanceSq
      setD(diff)
    }

    setDragging(true)

    return {onDragMove, onDragEnd, onPinchStart, onPinchMove}
  })

  const [d, setD] = useState(0)

  const drawingWindows = Object.values(windows).filter(w => w.metadata.type === "drawing" && w.metadata.drawingId in project.drawings)

  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        backgroundSize: `${backgroundGridSize}px ${backgroundGridSize}px`,
        backgroundImage: "radial-gradient(circle, gray 1px, transparent 1px)",
        backgroundPositionX: backgroundPositionOffset[0] + "px",
        backgroundPositionY: backgroundPositionOffset[1] + "px",
        cursor: dragging ? "grabbing" : "inherit",
      }}
    >
      <span>{d}</span>
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
