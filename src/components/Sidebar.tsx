import { useRef } from "react"
import { Explorer } from "./Explorer"
import { makeDragStartCallback } from "../lib/drag"
import logoImg from "../assets/logo.png"

type Props = {
  onResize: (width: number) => void
}

export function Sidebar(props: Props) {
  const draggingRef = useRef(false)

  const onPointerDownOnResizableArea = makeDragStartCallback(() => {
    if (draggingRef.current) {
      return
    }

    draggingRef.current = true

    const onDragging = (e: PointerEvent) => {
      if (draggingRef.current) {
        props.onResize(e.pageX)
      }
    }

    const onDragEnd = () => {
      draggingRef.current = false
    }

    return {onDragging, onDragEnd}
  })

  return (
    <div
      style={{
        boxShadow: "0px 0px 8px 0px gray",
        display: "grid",
        gridTemplateRows: "minmax(0, 1fr)",
        position: "relative",
        zIndex: 9999,
        background: "white",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr) auto",
        }}
      >
        <div
          style={{
            overflow: "hidden",
            padding: "12px",
          }}
        >
          <img
            src={logoImg}
            style={{
              backgroundSize: "8px 8px",
              backgroundImage: "repeating-linear-gradient(gray 0px 1px, transparent 1px 100%), repeating-linear-gradient(90deg, gray 0 1px, transparent 1px 100%)",
              border: "1px solid gray",
              borderTop: "none",
              borderLeft: "none",
            }}
          />
        </div>
        <Explorer />
        <div style={{textAlign: "center"}}>
          <span style={{display: "inline-block"}}><a style={{textDecoration: "none", color: "dodgerblue"}} href="https://github.com/tsujio/PixelStudio">Source code</a></span>
          <span style={{display: "inline-block", marginLeft: "16px"}}>&copy; <a style={{textDecoration: "none", color: "dodgerblue"}} href="https://www.tsujio.org">Tsujio Lab</a></span>
        </div>
      </div>
      <div
        style={{
          cursor: "ew-resize",
          position: "absolute",
          height: "100%",
          width: "4px",
          right: 0,
        }}
        onPointerDown={onPointerDownOnResizableArea}
      />
    </div>
  )
}