import React, { useRef, useState } from 'react'

type Props = {
  children: React.ReactNode
}

export default function Window(props: Props) {
  const windowRef = useRef<HTMLDivElement>(null)

  const [dragging, setDragging] = useState<boolean>(false)

  const [windowTop, setWindowTop] = useState<number>(100)
  const [windowLeft, setWindowLeft] = useState<number>(100)

  const draggableOffset = 16

  const onMouseDown = (e: any) => {
    if (!dragging && windowRef.current) {
      const w = windowRef.current
      const rect = w.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      if (x < draggableOffset || y < draggableOffset ||
         x > rect.width - draggableOffset || y > rect.height - draggableOffset) {
        const onMouseMove = (e: any) => {
          setWindowTop(e.pageY - y)
          setWindowLeft(e.pageX - x)
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
  }

  return (
    <div
      ref={windowRef}
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        top: windowTop,
        left: windowLeft,
        display: "inline-block",
        padding: "16px",
        border: "1px solid gray",
      }}
    >{props.children}</div>
  )
}
