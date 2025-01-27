import { useProjectContext } from "./ProjectContext"
import { Window } from "./Window"
import { Drawing } from "./Drawing"
import { useGesture } from "../lib/drag"
import { useState } from "react"
import { DrawingPanel } from "../lib/panel"

const backgroundGridSize = 42

export function Main() {
  const { project } = useProjectContext()

  const [perspective, setPerspective] = useState<[number, number]>([0, 0])

  const [dragging, setDragging] = useState(false)
  const gestureHandlers = useGesture({
    onDragStart: () => {
      setDragging(true)
    },
    onDragMove: (e, _, prevDragMoveData: [number, number] | undefined) => {
      if (prevDragMoveData) {
        const [diffX, diffY] = [e.pageX - prevDragMoveData[0], e.pageY - prevDragMoveData[1]]
        setPerspective(perspective => [
          perspective[0] - diffX,
          perspective[1] - diffY,
        ])
      }
      return [e.pageX, e.pageY] as [number, number]
    },
    onDragEnd: () => {
      setDragging(false)
    },
    onPinchStart: events => {
      const [e1, e2] = events
      return Math.pow(e1.pageX - e2.pageX, 2) + Math.pow(e1.pageY - e2.pageY, 2)
    },
    onPinchMove: (events, _, pinchStartData, prevPinchMoveData: number | undefined) => {
      const [e1, e2] = events
      const distanceSq = Math.pow(e1.pageX - e2.pageX, 2) + Math.pow(e1.pageY - e2.pageY, 2)
      const diff = distanceSq - (prevPinchMoveData ?? pinchStartData ?? 0)
      setD(diff)
      return distanceSq
    },
  })

  const [d, setD] = useState(0)

  return (
    <div
      {...gestureHandlers}
      style={{
        backgroundSize: `${backgroundGridSize}px ${backgroundGridSize}px`,
        backgroundImage: "radial-gradient(circle, gray 1px, transparent 1px)",
        backgroundPositionX: backgroundGridSize - (perspective[0] % backgroundGridSize) + "px",
        backgroundPositionY: backgroundGridSize - (perspective[1] % backgroundGridSize) + "px",
        cursor: dragging ? "grabbing" : "inherit",
      }}
    >
      <span>{d}</span>
      {project.panels.map((panel, i) =>
        <Window
          key={panel.id}
          panel={panel}
          top={panel.y - perspective[1]}
          left={panel.x - perspective[0]}
          zIndex={i + 1}
        >
          {panel instanceof DrawingPanel &&
          <Drawing
            drawing={project.getDrawing(panel.drawingId)}
          />}
        </Window>
      )}
    </div>
  )
}
