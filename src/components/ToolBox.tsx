import { useDrawContext, DrawTool } from "./DrawContext"
import { ToolBoxPenOptions } from "./ToolBoxPenOptions"
import { ToolBoxEraserOptions } from "./ToolBoxEraserOptions"
import { ToolBoxSelectOptions } from "./ToolBoxSelectOptions"
import { ToolBoxCanvasOptions } from "./ToolBoxCanvasOptions"
import { Palette } from "./Palette"
import { Icon } from "./Icon"
import { IconButton } from "./IconButton"

const tools = [
  {type: "pen", icon: "pen"},
  {type: "eraser", icon: "eraser"},
  {type: "select", icon: "select"},
  {type: "canvas", icon: "canvas"},
] as const

type Props = {
  open: boolean
  onClose: () => void
}

export const width = 330

export function ToolBox(props: Props) {
  const { drawContext, changeTool } = useDrawContext()

  const onToolChange = (tool: DrawTool) => () => {
    changeTool(tool)
  }

  const onPinClick = () => {
    props.onClose()
  }

  return (
    <div
      style={{
        width: props.open ? undefined : 0,
        height: "fit-content",
        position: "absolute",
        top: 0,
        right: 0,
        boxShadow: "0 0 8px 0 gray",
        zIndex: 9999,
        background: "white",
      }}
    >
      <div
        style={{
          width: props.open ? `${width}px` : 0,
          overflowX: props.open ? "inherit" : "hidden",
          padding: props.open ? "16px" : 0,
          boxSizing: "border-box",
          position: "relative",
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
        </div>
      </div>
    </div>
  )
}
