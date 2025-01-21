import { Drawing } from "../lib/drawing"
import { useProjectContext } from "./ProjectContext"
import { useWindowSystemContext } from "./WindowSystem"

export function ToolBoxCanvasOptions() {
  const { project, updateProject } = useProjectContext()
  const { windows, getActiveWindowId } = useWindowSystemContext()

  const activeDrawingWindowId = getActiveWindowId(true)
  let drawing: Drawing | undefined
  if (activeDrawingWindowId !== null) {
    const window = windows[activeDrawingWindowId]
    if (window.metadata.type !== "drawing") {
      throw new Error("Not a drawing window")
    }
    drawing = project.getDrawing(window.metadata.drawingId)
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
