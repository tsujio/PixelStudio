import { useProjectContext } from "./ProjectContext"
import { useDrawContext } from "./DrawContext"

export function ToolBoxSelectOptions() {
  const { project, updateProject } = useProjectContext()
  const { drawContext, copySelectArea, clearSelectArea } = useDrawContext()

  const onCopyButtonClick = () => {
    copySelectArea(project)
  }

  const onCutButtonClick = () => {
    if (drawContext.select.area) {
      const { start, end } = drawContext.select.area.rect
      const top = Math.min(start.rowIndex, end.rowIndex)
      const left = Math.min(start.columnIndex, end.columnIndex)
      const bottom = Math.max(start.rowIndex, end.rowIndex)
      const right = Math.max(start.columnIndex, end.columnIndex)
      const chainId = crypto.randomUUID()
      for (let i = top; i <= bottom; i++) {
        for (let j = left; j <= right; j++) {
          updateProject({
            type: "setPixel",
            drawingId: drawContext.select.area.drawingId,
            position: {
              rowIndex: i,
              columnIndex: j,
            },
            color: null,
            chainId,
          })
        }
      }
    }

    copySelectArea(project)
  }

  const onPasteButtonClick = () => {
    if (drawContext.select.area) {
      const value = drawContext.clipboard
      if (value && value.type === "data") {
        const { start, end } = drawContext.select.area.rect
        const top = Math.min(start.rowIndex, end.rowIndex)
        const left = Math.min(start.columnIndex, end.columnIndex)
        const chainId = crypto.randomUUID()
        const drawing = project.getDrawing(drawContext.select.area.drawingId)
        for (let i = 0; i < value.data.length; i++) {
          for (let j = 0; j < value.data[i].length; j++) {
            const position = {rowIndex: top + i, columnIndex: left + j}
            if (drawing.isValidPosition(position) && value.data[i][j] !== null) {
              updateProject({
                type: "setPixel",
                drawingId: drawing.id,
                position,
                color: value.data[i][j],
                chainId,
              })
            }
          }
        }
      }
    }
  }

  const onTrimButtonClick = () => {
    if (drawContext.select.area !== undefined) {
      const { start, end } = drawContext.select.area.rect
      const top = Math.min(start.rowIndex, end.rowIndex)
      const left = Math.min(start.columnIndex, end.columnIndex)
      const bottom = Math.max(start.rowIndex, end.rowIndex)
      const right = Math.max(start.columnIndex, end.columnIndex)
      const rect = {start: {rowIndex: top, columnIndex: left}, end: {rowIndex: bottom, columnIndex: right}}

      updateProject({type: "resizeDrawing", drawingId: drawContext.select.area.drawingId, rect})
    }
  }

  const onCancelButtonClick = () => {
    if (drawContext.select.area !== undefined) {
      clearSelectArea(drawContext.select.area.drawingId)
    }
  }

  return (
    <ul>
      <li><button onClick={onCopyButtonClick}>Copy</button></li>
      <li><button onClick={onCutButtonClick}>Cut</button></li>
      <li><button onClick={onPasteButtonClick}>Paste</button></li>
      <li><button onClick={onTrimButtonClick}>Trim</button></li>
      <li><button onClick={onCancelButtonClick}>Cancel</button></li>
    </ul>
  )
}
