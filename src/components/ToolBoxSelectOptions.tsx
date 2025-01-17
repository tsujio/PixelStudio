import { useProjectContext } from "./ProjectContext"
import { useDrawContext } from "./DrawContext"

export function ToolBoxSelectOptions() {
  const { updateProject } = useProjectContext()
  const { drawContext, clearSelectArea } = useDrawContext()

  const onTrimButtonClick = () => {
    if (drawContext.select.area !== undefined) {
      updateProject({
        type: "trimDrawing",
        drawingId: drawContext.select.area.drawingId,
        rect: drawContext.select.area.rect,
      })
    }
  }

  const onCancelButtonClick = () => {
    if (drawContext.select.area !== undefined) {
      clearSelectArea(drawContext.select.area.drawingId)
    }
  }

  return (
    <ul>
      <li><button onClick={onTrimButtonClick}>Trim</button></li>
      <li><button onClick={onCancelButtonClick}>Cancel</button></li>
    </ul>
  )
}
