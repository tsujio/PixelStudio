import React from 'react'
import { useDrawContext } from 'tsx!component/DrawContext'
import { useProjectContext } from 'tsx!component/ProjectContext'

type Props = {}

export default function ToolBoxSelectOptions(props: Props) {
  const { drawContext, updateDrawContext } = useDrawContext()
  const { project, updateProject } = useProjectContext()

  const onTrimButtonClick = () => {
    if (drawContext.select) {
      const { drawingId, start, end } = drawContext.select
      const top = Math.min(start.rowIndex, end.rowIndex)
      const left = Math.min(start.columnIndex, end.columnIndex)
      const bottom = Math.max(start.rowIndex, end.rowIndex)
      const right = Math.max(start.columnIndex, end.columnIndex)
      updateProject({
        type: "trimDrawing",
        drawingId,
        top,
        left,
        bottom,
        right,
      })

      updateDrawContext({type: "clearSelect"})
    }
  }

  const onClearButtonClick = () => {
    updateDrawContext({type: "clearSelect"})
  }

  return <>
    <div>
      <button onClick={onTrimButtonClick}>Trim</button>
      <button onClick={onClearButtonClick}>Clear</button>
    </div>
  </>
}
