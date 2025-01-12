import React, { useRef, useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react'

const WindowContext = createContext(null)

type Props = {
  id: string
  top?: number
  left?: number
  right?: number
  zIndex?: number
  onPositionUpdate: (windowId: string, top: number, left: number) => void
  onActivateWindow: (windowId: string) => void
  children: React.ReactNode
}

export default function Window(props: Props) {
  const windowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (windowRef.current && (props.top === undefined || (props.left === undefined && props.right === undefined))) {
      const w = windowRef.current
      const top = (window.innerHeight - w.offsetHeight) / 2
      const left = (window.innerWidth - w.offsetWidth) / 2
      props.onPositionUpdate(props.id, top, left)
    }
  }, [windowRef.current, props.top, props.left, props.right])

  const [dragging, setDragging] = useState<boolean>(false)

  const onMouseDownOnDraggableArea = (e: any) => {
    if (!dragging && windowRef.current) {
      const w = windowRef.current
      const rect = w.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const onMouseMove = (e: any) => {
        props.onPositionUpdate(props.id, e.pageY - y, e.pageX - x)
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
    props.onActivateWindow(props.id)
  }

  const [windowName, setWindowName] = useState<string>("")

  const activateWindow = useCallback((windowId?: string) => {
    props.onActivateWindow(windowId ?? props.id)
  }, [props.onActivateWindow, props.id])

  const windowContextValue = useMemo(() => ({
    setWindowName,
    activateWindow,
  }), [])

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
          padding: "12px",
        }}
      >
        <span>{windowName}</span>
      </div>
      <div
        style={{
          padding: "0 12px 12px",
        }}
      >
        <WindowContext.Provider value={windowContextValue}>
          {props.children}
        </WindowContext.Provider>
      </div>
    </div>
  )
}

export function useWindowContext() {
  return useContext(WindowContext)
}