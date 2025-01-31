import { useEffect, useRef, useState } from "react"
import { useDrawContext } from "./DrawContext"
import { Icon } from "./Icon"
import { useProjectContext } from "./ProjectContext"
import { useWindowContext } from "./WindowContext"
import { HSVColor } from "../lib/color"

export const MobileNavigation = () => {
  const { updateProject } = useProjectContext()
  const { windowSize } = useWindowContext()
  const { drawContext, changeTool, changePenColor } = useDrawContext()

  const onUndoButtonClick = () => {
    updateProject({type: "undo"})
  }

  const onRedoButtonClick = () => {
    updateProject({type: "redo"})
  }

  const onPenButtonClick = () => {
    changeTool("pen")
  }

  const onEraserButtonClick = () => {
    changeTool("eraser")
  }

  const [colorPickerOpen, setColorPickerOpen] = useState(false)

  const onColorButtonClick = () => {
    setColorPickerOpen(colorPickerOpen => !colorPickerOpen)
  }

  const onColorPickerClick = (color: HSVColor) => () => {
    changePenColor(color)
    changeTool("pen")
    setColorPickerOpen(false)
  }

  const onColorPickerBlur = () => {
    // HACK: Clicking color picker button to close it does not work because this handler triggered before onClick handler.
    //       So use setTimeout to delay handler process.
    setTimeout(() => {
      setColorPickerOpen(false)
    }, 50)
  }

  const colorPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (colorPickerRef.current && colorPickerOpen) {
      colorPickerRef.current.focus()
    }
  }, [colorPickerOpen])

  if (windowSize.type !== "mobile") {
    return null
  }

  const buttons = [
    {
      icon: <Icon icon="undo" />,
      handler: onUndoButtonClick,
    },
    {
      icon: <Icon icon="redo" />,
      handler: onRedoButtonClick,
    },
    {
      icon: <Icon icon="pen" />,
      handler: onPenButtonClick,
      style: drawContext.tool === "pen" ? {
        border: "4px solid steelblue",
        borderRadius: "4px",
      } : undefined,
    },
    {
      icon: <Icon icon="eraser" />,
      handler: onEraserButtonClick,
      style: drawContext.tool === "eraser" ? {
        border: "4px solid steelblue",
        borderRadius: "4px",
      } : undefined,
    },
    {
      icon: <div style={{
        background: drawContext.pen.color.css,
        width: "36px",
        height: "24px",
        boxSizing: "border-box",
        border: "1px solid gray",
        borderRadius: "2px",
      }} />,
      handler: onColorButtonClick,
    },
  ]

  const colorPickerRows = 10
  const colorPickerColumns = 5

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 9998,
        display: "grid",
        gridTemplateColumns: `repeat(${buttons.length}, 1fr)`,
        placeItems: "center",
        height: "56px",
        width: "100%",
        background: "whitesmoke",
        bottom: 0,
        left: 0,
        borderTop: "2px solid lightgray",
      }}
    >
      {buttons.map(({icon, handler, style}, i) =>
        <div
          key={i}
          style={{
            display: "grid",
            placeItems: "center",
            width: "min(100%, 96px)",
            height: "100%",
            cursor: "pointer",
            boxSizing: "border-box",
            ...style
          }}
          onClick={handler}
        >
          {icon}
        </div>
      )}
      {colorPickerOpen &&
      <div
        ref={colorPickerRef}
        tabIndex={-1}
        style={{
          position: "absolute",
          top: -600,
          right: 0,
          background: "white",
          width: "350px",
          height: "600px",
          display: "grid",
          gridTemplateColumns: `repeat(${colorPickerColumns}, 1fr)`,
          gridTemplateRows: `repeat(${colorPickerRows}, 1fr)`,
        }}
        onBlur={onColorPickerBlur}
      >
        {[...Array(colorPickerRows)].map((_, i) =>
          [...Array(colorPickerColumns)].map((_, j) => {
            let h: number, s: number, v: number
            if (i === 0) {
              h = 0
              s = 0
              v = Math.round(100 / (colorPickerColumns - 1) * (colorPickerColumns - (j + 1)))
            } else {
              h = Math.round(360 / (colorPickerRows - 1) * (i - 1))
              s = Math.round(Math.min(100 / Math.ceil(colorPickerColumns / 2) * (j + 1), 100))
              v = Math.round(Math.min(100 / Math.ceil(colorPickerColumns / 2) * (colorPickerColumns - j), 100))
            }
            const color = new HSVColor([h, s, v])
            return <div
              key={`${i}-${j}`}
              style={{
                background: color.css,
                ...(drawContext.pen.color.equalTo(color) && {
                  border: `2px solid ${(s < 50 && v > 70) || (30 <= h && h <= 190 && v > 70)? "black" : "white"}`,
                  borderRadius: "2px",
                }),
              }}
              onClick={onColorPickerClick(color)}
            />
          })
        ).flat()}
      </div>}
    </div>
  )
}
