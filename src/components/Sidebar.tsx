import { useRef } from "react"
import { Explorer } from "./Explorer"
import { makeDragStartCallback } from "../lib/drag"
import logoImg from "../assets/logo.png"

type Props = {
  onResize: (width: number) => void
}

export function Sidebar(props: Props) {
  const draggingRef = useRef(false)

  const onMouseDownOnResizableArea = makeDragStartCallback(() => {
    if (draggingRef.current) {
      return
    }

    draggingRef.current = true

    const onDragging = (e: MouseEvent) => {
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
        position: "relative",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
        }}
      >
        <div style={{overflow: "hidden"}}>
          <img src={logoImg} />
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
        onMouseDown={onMouseDownOnResizableArea}
      />
    </div>
  )
}