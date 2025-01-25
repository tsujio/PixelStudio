import { useDrawContext, DrawTool } from "./DrawContext"
import { ToolBoxPenOptions } from "./ToolBoxPenOptions"
import { ToolBoxEraserOptions } from "./ToolBoxEraserOptions"
import { ToolBoxSelectOptions } from "./ToolBoxSelectOptions"
import { ToolBoxCanvasOptions } from "./ToolBoxCanvasOptions"
import { Palette } from "./Palette"
import { Icon } from "./Icon"
import { IconButton } from "./IconButton"
import { useState } from "react"

const tools = [
  {type: "pen", icon: "pen"},
  {type: "eraser", icon: "eraser"},
  {type: "select", icon: "select"},
  {type: "canvas", icon: "close"},
] as const

export function ToolBox() {
  const { drawContext, changeTool } = useDrawContext()

  const onToolChange = (tool: DrawTool) => () => {
    changeTool(tool)
  }

  const [pinned, setPinned] = useState(true)

  const onPinClick = () => {
    setPinned(false)
  }

  const onOpenToolBoxClick = () => {
    setPinned(true)
  }

  return (
    <div
      style={{
        width: pinned ? "330px" : 0,
        height: "fit-content",
        position: "relative",
        boxShadow: "0 0 8px 0 gray",
        zIndex: 9999,
        background: "white",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: pinned ? undefined : 0,
          overflowX: pinned ? "inherit" : "hidden",
          padding: "16px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          {tools.map(tool =>
            <div
              key={tool.type}
              onClick={onToolChange(tool.type)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: drawContext.tool === tool.type ? "4px solid gray" : "none",
                borderRadius: "4px",
                aspectRatio: "1 / 1",
              }}
            >
              <Icon icon={tool.icon} />
            </div>
          )}
        </div>
        {drawContext.tool === "pen" && <ToolBoxPenOptions />}
        {drawContext.tool === "eraser" && <ToolBoxEraserOptions />}
        {drawContext.tool === "select" && <ToolBoxSelectOptions />}
        {drawContext.tool === "canvas" && <ToolBoxCanvasOptions />}
        <div style={{marginTop: "8px"}}>
          <Palette />
        </div>
      </div>
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
          left: -50,
        }}
      >
        <IconButton
          icon="pen"
          size="small"
          onClick={onOpenToolBoxClick}
        />
      </div>}
    </div>
  )
}
