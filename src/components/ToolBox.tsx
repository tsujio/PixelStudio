import { useDrawContext, DrawTool } from "./DrawContext"
import { ToolBoxPenOptions } from "./ToolBoxPenOptions"
import { ToolBoxEraserOptions } from "./ToolBoxEraserOptions"
import { ToolBoxSelectOptions } from "./ToolBoxSelectOptions"

const tools = [
  {type: "pen"},
  {type: "eraser"},
  {type: "select"},
]

export function ToolBox() {
  const { drawContext, changeTool } = useDrawContext()

  const onToolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    changeTool(e.target.value as DrawTool)
  }

  return (
    <div style={{width: "300px"}}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
        }}
      >
        {tools.map(tool =>
          <div
            key={tool.type}
          >
            <input
              type="radio"
              name="tool"
              value={tool.type}
              checked={drawContext.tool === tool.type}
              onChange={onToolChange}
            />
          </div>
        )}
      </div>
      {drawContext.tool === "pen" && <ToolBoxPenOptions />}
      {drawContext.tool === "eraser" && <ToolBoxEraserOptions />}
      {drawContext.tool === "select" && <ToolBoxSelectOptions />}
    </div>
  )
}
