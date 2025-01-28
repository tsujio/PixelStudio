import { useEffect, useRef, useState } from "react"
import { Explorer } from "./Explorer"
import { useGesture } from "../lib/gesture"
import logoImg from "../assets/logo.png"
import { IconButton } from "./IconButton"

export function Sidebar() {
  const contentRef = useRef(null)

  const [width, setWidth] = useState(250)

  const gestureHandlers = useGesture({
    onDragMove: e => {
      const width = e.pageX
      if (width > 0 && width < window.innerWidth) {
        setWidth(width)
      }
    }
  })

  const [pinned, setPinned] = useState(() => {
    return window.innerWidth > 1000
  })

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

  return (
    <div
      style={{
        width: pinned ? width : 0,
        boxShadow: "0px 0px 8px 0px gray",
        display: "grid",
        gridTemplateRows: "minmax(0, 1fr)",
        position: "relative",
        zIndex: 9999,
        background: "white",
      }}
    >
      <div
        ref={contentRef}
        style={{
          width: pinned ? undefined : 0,
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
        <Explorer />
        <div style={{textAlign: "center", whiteSpace: "nowrap"}}>
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