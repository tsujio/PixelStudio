import React, { useRef, useState, createContext, useContext, useMemo } from 'react'
import { useWindowSystemContext } from './WindowSystem'
import { makeDragStartCallback } from '../lib/drag'

type WindowContextValue = {
  windowId: string
  setWindowName: (name: string) => void
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
  id: string
  top?: number
  left?: number
  right?: number
  zIndex?: number
  children: React.ReactNode
}

export function Window(props: Props) {
  const { activateWindow, moveWindow } = useWindowSystemContext()

  const windowRef = useRef<HTMLDivElement>(null)

  const [dragging, setDragging] = useState<boolean>(false)

  const onPointerDownOnDraggableArea = makeDragStartCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging && windowRef.current) {
      const w = windowRef.current
      const rect = w.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const onDragging = (e: PointerEvent) => {
        moveWindow(props.id, e.pageY - y, e.pageX - x)
      }

      const onDragEnd = () => {
        setDragging(false)
      }

      setDragging(true)

      return { onDragging, onDragEnd }
    }
  })

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    activateWindow(props.id)
  }

  const [windowName, setWindowName] = useState<string>("")

  const windowContextValue = useMemo(() => ({
    windowId: props.id,
    setWindowName,
  }), [props.id])

  return (
    <div
      ref={windowRef}
      onPointerDown={onPointerDown}
      style={{
        position: "absolute",
        top: props.top,
        left: props.left,
        right: props.right,
        zIndex: props.zIndex,
        display: "inline-block",
        borderRadius: "8px",
        boxShadow: "2px 4px 16px 4px lightgray",
        background: "white",
      }}
    >
      <div
        onPointerDown={onPointerDownOnDraggableArea}
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
