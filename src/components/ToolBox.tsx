import { useDrawContext, DrawTool } from "./DrawContext"
import { ToolBoxPenOptions } from "./ToolBoxPenOptions"
import { ToolBoxEraserOptions } from "./ToolBoxEraserOptions"
import { ToolBoxSelectOptions } from "./ToolBoxSelectOptions"
import { ToolBoxCanvasOptions } from "./ToolBoxCanvasOptions"
import { Palette } from "./Palette"
import { Icon } from "./Icon"

const tools = [
  {type: "pen", icon: "pen"},
  {type: "eraser", icon: "eraser"},
  {type: "select", icon: "select"},
  {type: "canvas", icon: "close"},
] as const

const toolBoxWidth = 300

export function ToolBox() {
  const { drawContext, changeTool } = useDrawContext()

  const onToolChange = (tool: DrawTool) => () => {
    changeTool(tool)
  }

  return (
    <div
      style={{
        width: toolBoxWidth + "px",
        position: "absolute",
        top: 0,
        right: 0,
        padding: "16px",
        boxShadow: "0 0 8px 0 gray",
        zIndex: 9999,
        background: "white",
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
  )
}
