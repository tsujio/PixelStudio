import { useEffect, useRef, useState } from "react"
import { Explorer } from "./Explorer"
import { useGesture } from "./GestureContext"
import logoImg from "../assets/logo.png"
import { IconButton } from "./IconButton"
import { useWindowContext } from "./WindowContext"
import { useBoardContext } from "./BoardContext"

type Props = {
  width: number
  onWidthChange: (width: number) => void
}

export function Sidebar(props: Props) {
  const { windowSize } = useWindowContext()
  const { boardNavigation, updateBoardNavigation } = useBoardContext()

  const contentRef = useRef(null)

  const gestureHandlers = useGesture({
    onDragMove: e => {
      const width = e.pageX
      if (width > 0 && width < windowSize.width) {
        props.onWidthChange(width)
      }
    }
  })

  const [open, setOpen] = useState(windowSize.type === "desktop")

  useEffect(() => {
    if (contentRef.current) {
      const contentWidth = parseInt(window.getComputedStyle(contentRef.current).width)
      if (props.width < contentWidth) {
        props.onWidthChange(contentWidth)
      }
    }
  }, [props.width])

  const onCloseButtonClick = () => {
    setOpen(false)

    if (windowSize.type === "mobile") {
      const perspective: [number, number] = [...boardNavigation.perspective]
      perspective[0] += props.width / boardNavigation.zoom
      updateBoardNavigation({type: "setPerspective", perspective})
    }
  }

  const onHamburgerClick = () => {
    setOpen(true)

    if (windowSize.type === "mobile") {
      const perspective: [number, number] = [...boardNavigation.perspective]
      perspective[0] -= props.width / boardNavigation.zoom
      updateBoardNavigation({type: "setPerspective", perspective})
    }
  }

  return (
    <div
      style={{
        width: props.width,
        height: "100%",
        boxShadow: "0px 0px 8px 0px gray",
        display: "grid",
        gridTemplateRows: "minmax(0, 1fr)",
        position: "absolute",
        top: 0,
        left: open ? 0 : props.width > 0 ? -(props.width + 8) : -999,
        zIndex: 9999,
        background: "white",
      }}
    >
      <div
        ref={contentRef}
        style={{
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr) auto",
        }}
      >
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr"}}>
          <div
            style={{
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
          <div>
            <IconButton
              icon="left"
              size="small"
              onClick={onCloseButtonClick}
            />
          </div>
        </div>
        <Explorer sidebarWidth={props.width} />
        <div style={{textAlign: "center", whiteSpace: "nowrap", padding: "8px", fontSize: "14px"}}>
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
        {...gestureHandlers}
      />
      {!open &&
      <div
        style={{
          position: "absolute",
          top: 10,
          right: -50,
        }}
      >
        <IconButton
          icon="hamburger"
          size="small"
          onClick={onHamburgerClick}
        />
      </div>}
    </div>
  )
}