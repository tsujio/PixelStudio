import { useRef } from "react"
import { Explorer } from "./Explorer"

type Props = {
  onResize: (width: number) => void
}

export function Sidebar(props: Props) {
  const draggingRef = useRef(false)

  const onMouseDownOnResizableArea = () => {
    if (draggingRef.current) {
      return
    }

    draggingRef.current = true

    const onMouseMove = (e: MouseEvent) => {
      if (draggingRef.current) {
        props.onResize(e.pageX)
      }
    }

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
      draggingRef.current = false
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }

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
        <div>
          <h1>Pixel Studio</h1>
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