import { DrawingPanel } from "../lib/panel"
import { useProjectContext } from "./ProjectContext"

export function ToolBoxCanvasOptions() {
  const { project, updateProject } = useProjectContext()

  const activePanel = project.getActivePanel()
  const drawing = activePanel instanceof DrawingPanel ? project.getDrawing(activePanel.drawingId) : undefined

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
