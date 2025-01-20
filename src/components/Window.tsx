import React, { useRef, useState, createContext, useContext, useMemo } from 'react'
import { useWindowSystemContext } from './WindowSystem'

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

export const windowSidePadding = 12

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

  const onMouseDownOnDraggableArea = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging && windowRef.current) {
      const w = windowRef.current
      const rect = w.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const onMouseMove = (e: MouseEvent) => {
        moveWindow(props.id, e.pageY - y, e.pageX - x)
      }

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)

        setDragging(false)
      }

      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)

      setDragging(true)
    }
  }

  const onMouseDown = () => {
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
      onMouseDown={onMouseDown}
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
        onMouseDown={onMouseDownOnDraggableArea}
        style={{
          cursor: dragging ? "grabbing" : "grab",
          display: "flex",
          alignItems: "center",
          padding: `12px ${windowSidePadding}px`,
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
