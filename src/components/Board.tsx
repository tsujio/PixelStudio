import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useProjectContext } from './ProjectContext'
import { Panel } from "./Panel"
import { Drawing } from "./Drawing"
import { useGesture } from './GestureContext'
import { DrawingPanel } from '../lib/panel'
import { ToolBox } from './ToolBox'

type BoardNavigation = {
  perspective: [number, number]
  zoom: number
}

type BoardContextValue = {
  boardNavigation: BoardNavigation
  updateBoardNavigation: (action: Action) => void
}

const BoardContext = createContext<BoardContextValue | null>(null)

type Action =
  {
    type: "setPerspective"
    perspective: [number, number]
  } |
  {
    type: "setZoom"
    zoom: number
    basePoint: [number, number]
  }

const reducer = (boardNavigation: BoardNavigation, action: Action) => {
  switch (action.type) {
    case "setPerspective": {
      if (boardNavigation.perspective[0] === action.perspective[0] && boardNavigation.perspective[1] === action.perspective[1]) {
        return boardNavigation
      }
      return {
        ...boardNavigation,
        perspective: action.perspective,
      }
    }
    case "setZoom": {
      if (boardNavigation.zoom === action.zoom) {
        return boardNavigation
      }
      const [b1, p1, z1, z2]  = [action.basePoint, boardNavigation.perspective, boardNavigation.zoom, action.zoom]
      const perspective = [
        // b1 == (x - p1) * z1
        // b2 == (x - p2) * z2
        // b1 == b2 <=> p2 == b1 / z1 + p1 - b1 / z2
        b1[0] / z1 + p1[0] - b1[0] / z2,
        b1[1] / z1 + p1[1] - b1[1] / z2,
      ] as [number, number]
      return {
        ...boardNavigation,
        zoom: action.zoom,
        perspective: perspective,
      }
    }
  }
}

export const Board = () => {
  const { project } = useProjectContext()

  const [boardNavigation, updateBoardNavigation] = useReducer(reducer, {perspective: [0, 0], zoom: 1.0})

  const [dragging, setDragging] = useState(false)
  const gestureHandlers = useGesture({
    forceAcquireLockOnPinchStart: true,
    onDragStart: e => {
      if (e.target === e.currentTarget) {
        setDragging(true)
      }
      return [e.pageX, e.pageY] as [number, number]
    },
    onDragMove: (e, dragStartData, prevDragMoveData: [number, number] | undefined) => {
      if (dragging) {
        const [prevX, prevY] = prevDragMoveData ?? dragStartData
        const [diffX, diffY] = [e.pageX - prevX, e.pageY - prevY]
        updateBoardNavigation({type: "setPerspective", perspective: [
          boardNavigation.perspective[0] - diffX / boardNavigation.zoom,
          boardNavigation.perspective[1] - diffY / boardNavigation.zoom,
        ]})
      }
      return [e.pageX, e.pageY] as [number, number]
    },
    onDragEnd: () => {
      setDragging(false)
    },
    onPinchStart: ([e1, e2]) => {
      return {
        zoom: boardNavigation.zoom,
        basePoint: [(e1.pageX + e2.pageX) / 2, (e1.pageY + e2.pageY) / 2] as [number, number],
        distance: Math.sqrt(Math.pow(e1.pageX - e2.pageX, 2) + Math.pow(e1.pageY - e2.pageY, 2)),
      }
    },
    onPinchMove: ([e1, e2], _, pinchStartData) => {
      const distance = Math.sqrt(Math.pow(e1.pageX - e2.pageX, 2) + Math.pow(e1.pageY - e2.pageY, 2))
      const ratio = distance / pinchStartData.distance
      const zoom = pinchStartData.zoom * ratio
      updateBoardNavigation({type: "setZoom", zoom, basePoint: pinchStartData.basePoint})
    },
  })

  const pointerPositionRef = useRef<[number, number]>([0, 0])
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
        updateBoardNavigation({type: "setZoom", zoom: boardNavigation.zoom + 0.1, basePoint: pointerPositionRef.current})
      }

      if (e.ctrlKey && e.code === "Minus") {
        e.preventDefault()
        updateBoardNavigation({type: "setZoom", zoom: boardNavigation.zoom - 0.1, basePoint: pointerPositionRef.current})
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [boardNavigation.zoom])

  const contextValue = useMemo(() => ({
    boardNavigation,
    updateBoardNavigation,
  }), [boardNavigation])

  return (
    <BoardContext.Provider value={contextValue}>
      <div
        {...gestureHandlers}
        style={{
          position: "relative",
          backgroundSize: `${42 * boardNavigation.zoom}px ${42 * boardNavigation.zoom}px`,
          backgroundImage: `radial-gradient(circle, gray ${1 * boardNavigation.zoom}px, transparent ${1 * boardNavigation.zoom}px)`,
          backgroundPositionX:  -boardNavigation.perspective[0] * boardNavigation.zoom + "px",
          backgroundPositionY:  -boardNavigation.perspective[1] * boardNavigation.zoom + "px",
          cursor: dragging ? "grabbing" : "inherit",
        }}
      >
        {project.panels.map((panel, i) =>
          <Panel
            key={panel.id}
            panel={panel}
            top={(panel.y - boardNavigation.perspective[1]) * boardNavigation.zoom}
            left={(panel.x - boardNavigation.perspective[0]) * boardNavigation.zoom}
            zIndex={i + 1}
          >
            {panel instanceof DrawingPanel &&
            <Drawing
              drawing={project.getDrawing(panel.drawingId)}
            />}
          </Panel>
        )}
      </div>
      <ToolBox />
    </BoardContext.Provider>
  )
}

export const useBoardContext = () => {
  const value = useContext(BoardContext)
  if (value === null) {
    throw new Error("Not in a board context")
  }
  return value
}
