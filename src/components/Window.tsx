import React, { useRef, useState, createContext, useContext, useMemo } from 'react'
import { useGesture } from '../lib/gesture'
import { useProjectContext } from './ProjectContext'
import { Panel } from '../lib/panel'

type WindowContextValue = {
  windowId: string
  setWindowName: (name: string) => void
  setWindowPositionOffset: (position: [number, number]) => void
}

const WindowContext = createContext<WindowContextValue | null>(null)

export function useWindowContext() {
  const value = useContext(WindowContext)
  if (value === null) {
    throw new Error("Not in the window context")
  }
  return value
}

const windowSidePadding = 12

type Props = {
  panel: Panel
  top: number
  left: number
  zIndex?: number
  children: React.ReactNode
}

export function Window(props: Props) {
  const { updateProject } = useProjectContext()

  const windowRef = useRef<HTMLDivElement>(null)

  const [dragging, setDragging] = useState<boolean>(false)

  const [windowPositionOffset, setWindowPositionOffset] = useState<[number, number]>([0, 0])

  const draggableAreaGestureHandlers = useGesture({
    onDragStart: e => {
      setDragging(true)
      return {
        panelPos: [props.panel.x, props.panel.y] as const,
        eventPos: [e.pageX, e.pageY] as const,
      }
    },
    onDragMove: (e, dragStartData) => {
      const [diffX, diffY] = [e.pageX - dragStartData.eventPos[0], e.pageY - dragStartData.eventPos[1]]
      setWindowPositionOffset([diffX, diffY])
    },
    onDragEnd: (e, dragStartData) => {
      const [diffX, diffY] = [e.pageX - dragStartData.eventPos[0], e.pageY - dragStartData.eventPos[1]]
      updateProject({type: "movePanel", panelId: props.panel.id, x: dragStartData.panelPos[0] + diffX, y: dragStartData.panelPos[1] + diffY})
      setWindowPositionOffset([0, 0])
      setDragging(false)
    },
  })

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    updateProject({type: "activatePanel", panelId: props.panel.id})
  }

  const [windowName, setWindowName] = useState<string>("")

  const windowContextValue = useMemo(() => ({
    windowId: props.panel.id,
    setWindowName,
    setWindowPositionOffset,
  }), [props.panel.id])

  return (
    <div
      ref={windowRef}
      onPointerDown={onPointerDown}
      style={{
        position: "absolute",
        top: props.top + windowPositionOffset[1],
        left: props.left + windowPositionOffset[0],
        zIndex: props.zIndex,
        display: "inline-block",
        borderRadius: "8px",
        boxShadow: "2px 4px 16px 4px lightgray",
        background: "white",
      }}
    >
      <div
        {...draggableAreaGestureHandlers}
        style={{
          cursor: dragging ? "grabbing" : "grab",
          display: "flex",
          alignItems: "center",
          padding: `12px ${windowSidePadding}px`,
          userSelect: "none",
        }}
      >
        <span>{windowName}</span>
      </div>
      <div
        style={{
          padding: `0 ${windowSidePadding}px 12px`,
        }}
      >
        <WindowContext.Provider value={windowContextValue}>
          {props.children}
        </WindowContext.Provider>
      </div>
    </div>
  )
}
