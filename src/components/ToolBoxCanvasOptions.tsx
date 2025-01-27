import { Drawing } from "../lib/drawing"
import { DrawingPanel } from "../lib/panel"
import { useProjectContext } from "./ProjectContext"

export function ToolBoxCanvasOptions() {
  const { project, updateProject } = useProjectContext()

  let drawing: Drawing | undefined
  if (project.panels.length > 0) {
    const panel = project.panels[project.panels.length - 1]
    if (panel instanceof DrawingPanel) {
      drawing = project.getDrawing(panel.drawingId)
    }
  }

  const onPixelSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (drawing) {
      const pixelSize = parseInt(e.target.value)
      updateProject({type: "setPixelSize", drawingId: drawing.id, pixelSize})
    }
  }

  return (
    <div>
      <input type="number" value={drawing?.pixelSize ?? 0} onChange={onPixelSizeChange} />
    </div>
  )
}
