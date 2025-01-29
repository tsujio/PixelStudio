import { useProjectContext } from "./ProjectContext"
import { Window } from "./Window"
import { Drawing } from "./Drawing"
import { useGesture } from "../lib/gesture"
import { useEffect, useRef, useState } from "react"
import { DrawingPanel } from "../lib/panel"
import { useWindowSystemContext } from "./WindowSystem"

const backgroundGridSize = 42

export function Main() {
  const { project } = useProjectContext()

  const [perspective, setPerspective] = useState<[number, number]>([0, 0])

  const [dragging, setDragging] = useState(false)
  const gestureHandlers = useGesture({
    onDragStart: e => {
      setDragging(true)
      return [e.pageX, e.pageY] as [number, number]
    },
    onDragMove: (e, dragStartData, prevDragMoveData: [number, number] | undefined) => {
      const [prevX, prevY] = prevDragMoveData ?? dragStartData
      const [diffX, diffY] = [e.pageX - prevX, e.pageY - prevY]
      setPerspective(perspective => [
        perspective[0] - diffX,
        perspective[1] - diffY,
      ])
      return [e.pageX, e.pageY] as [number, number]
    },
    onDragEnd: () => {
      setDragging(false)
    },
    onPinchStart: ([e1, e2]) => {
      return Math.pow(e1.pageX - e2.pageX, 2) + Math.pow(e1.pageY - e2.pageY, 2)
    },
    onPinchMove: ([e1, e2], _, pinchStartData, prevPinchMoveData: number | undefined) => {
      const distanceSq = Math.pow(e1.pageX - e2.pageX, 2) + Math.pow(e1.pageY - e2.pageY, 2)
      const center = [(e1.pageX + e2.pageX) / 2, (e1.pageY + e2.pageY) / 2]
      const diff = distanceSq - (prevPinchMoveData ?? pinchStartData ?? 0)

      const newZoom = state.zoom + diff / ff
      updateWindowSystemState({type: "setZoom", zoom: newZoom})
      setPerspective(perspective => {
        const [f1, p1, z1, z2]  = [center, perspective, state.zoom, newZoom]
        return [
          // f1 == (x - p1) * z1
          // f2 == (x - p2) * z2
          // f1 == f2 <=> p2 == f1 / z1 + p1 - f1 / z2
          f1[0] / z1 + p1[0] - f1[0] / z2,
          f1[1] / z1 + p1[1] - f1[1] / z2,
        ]
      })

      return distanceSq
    },
  })

  const { state, updateWindowSystemState } = useWindowSystemContext()

  const pointerPositionRef = useRef([0, 0])
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      pointerPositionRef.current = [e.pageX, e.pageY]
    }
    document.addEventListener("pointermove", onPointerMove)
    return () => {
      document.removeEventListener("pointermove", onPointerMove)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Semicolon") {
        e.preventDefault()
        const newZoom = state.zoom + 0.1
        updateWindowSystemState({type: "setZoom", zoom: newZoom})
        setPerspective(perspective => {
          const [f1, p1, z1, z2]  = [pointerPositionRef.current, perspective, state.zoom, newZoom]
          return [
            // f1 == (x - p1) * z1
            // f2 == (x - p2) * z2
            // f1 == f2 <=> p2 == f1 / z1 + p1 - f1 / z2
            f1[0] / z1 + p1[0] - f1[0] / z2,
            f1[1] / z1 + p1[1] - f1[1] / z2,
          ]
        })
      }

      if (e.ctrlKey && e.code === "Minus") {
        e.preventDefault()
        const newZoom = state.zoom - 0.1
        updateWindowSystemState({type: "setZoom", zoom: newZoom})
        setPerspective(perspective => {
          const [f1, p1, z1, z2]  = [pointerPositionRef.current, perspective, state.zoom, newZoom]
          return [
            f1[0] / z1 + p1[0] - f1[0] / z2,
            f1[1] / z1 + p1[1] - f1[1] / z2,
          ]
        })
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [state.zoom])
const [ff, setFF] = useState(5000.0)
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
      <input type="text" value={ff} onChange={e => setFF(parseInt(e.target.value))} />
      {project.panels.map((panel, i) =>
        <Window
          key={panel.id}
          panel={panel}
          top={(panel.y - perspective[1]) * state.zoom}
          left={(panel.x - perspective[0]) * state.zoom}
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
