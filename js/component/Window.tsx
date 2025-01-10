import React, { useRef, useState, useEffect } from 'react'

type Props = {
  id: string
  top?: number
  left?: number
  onPositionUpdate: (windowId: string, top: number, left: number) => void
  children: React.ReactNode
}

export default function Window(props: Props) {
  const windowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (windowRef.current && (props.top === undefined || props.left === undefined)) {
      const w = windowRef.current
      const top = (window.innerHeight - w.offsetHeight) / 2
      const left = (window.innerWidth - w.offsetWidth) / 2
      props.onPositionUpdate(props.id, top, left)
    }
  }, [windowRef.current, props.top, props.left])

  const [dragging, setDragging] = useState<boolean>(false)

  const onMouseDown = (e: any) => {
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

  return (
    <div
      ref={windowRef}
      style={{
        position: "absolute",
        top: props.top,
        left: props.left,
        display: "inline-block",
        borderRadius: "8px",
        boxShadow: "2px 4px 16px 4px lightgray",
        background: "white",
      }}
    >
      <div
        onMouseDown={onMouseDown}
        style={{
          cursor: dragging ? "grabbing" : "grab",
          height: "32px",
        }}
      />
      <div
        style={{
          padding: "0 12px 12px",
        }}
      >
        {props.children}
      </div>
    </div>
  )
}
