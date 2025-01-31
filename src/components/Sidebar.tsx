import { useEffect, useRef, useState } from "react"
import { Explorer } from "./Explorer"
import { useGesture } from "./GestureContext"
import logoImg from "../assets/logo.png"
import { IconButton } from "./IconButton"
import { useWindowContext } from "./WindowContext"

export function Sidebar() {
  const { windowSize } = useWindowContext()

  const contentRef = useRef(null)

  const [width, setWidth] = useState(210)

  const gestureHandlers = useGesture({
    onDragMove: e => {
      const width = e.pageX
      if (width > 0 && width < windowSize.width) {
        setWidth(width)
      }
    }
  })

  const [pinned, setPinned] = useState(windowSize.type === "desktop")

  useEffect(() => {
    if (contentRef.current && pinned) {
      const contentWidth = parseInt(window.getComputedStyle(contentRef.current).width)
      if (width < contentWidth) {
        setWidth(contentWidth)
      }
    }
  }, [width, pinned])

  const onPinClick = () => {
    setPinned(false)
  }

  const onHamburgerClick = () => {
    setPinned(true)
  }

  const sidebarWidth = pinned ? width : 0

  return (
    <div
      style={{
        width: sidebarWidth,
        height: "100%",
        boxShadow: "0px 0px 8px 0px gray",
        display: "grid",
        gridTemplateRows: "minmax(0, 1fr)",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 9999,
        background: "white",
      }}
    >
      <div
        ref={contentRef}
        style={{
          overflowX: pinned ? "inherit" : "hidden",
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr) auto",
        }}
      >
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
        <Explorer sidebarWidth={sidebarWidth} />
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
      {pinned &&
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
      >
        <IconButton
          icon="pin"
          size="small"
          onClick={onPinClick}
        />
      </div>}
      {!pinned &&
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