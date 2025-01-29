import { useEffect, useState } from "react"
import { usePanelContext } from "./Panel"
import { useProjectContext } from "./ProjectContext"
import { Canvas } from "./Canvas"
import { ResizableArea } from "./ResizableArea"
import { Drawing as DrawingClass, DrawingDataRect } from "../lib/drawing"

type Props = {
  drawing: DrawingClass
}

export function Drawing(props: Props) {
  const { setPanelName, setPanelPositionOffset } = usePanelContext()
  const { updateProject } = useProjectContext()

  const [mask, setMask] = useState<DrawingDataRect | null>(null)

  const rowCount = mask ? mask.end.rowIndex - mask.start.rowIndex + 1 : props.drawing.rowCount
  const columnCount = mask ? mask.end.columnIndex - mask.start.columnIndex + 1 : props.drawing.columnCount

  useEffect(() => {
    setPanelName(`${props.drawing.name} (${rowCount} x ${columnCount})`)
  }, [setPanelName, props.drawing.name, rowCount, columnCount])

  const onResize = (diff: {top: number, left: number, bottom: number, right: number}, fix: boolean) => {
    const newMask = {
      start: {
        rowIndex: Math.min(0 + Math.trunc(diff.top / props.drawing.pixelSize), props.drawing.rowCount - 1),
        columnIndex: Math.min(0 + Math.trunc(diff.left / props.drawing.pixelSize), props.drawing.columnCount - 1),
      },
      end: {
        rowIndex: Math.max(props.drawing.rowCount - 1 + Math.trunc(diff.bottom / props.drawing.pixelSize), 0),
        columnIndex: Math.max(props.drawing.columnCount - 1 + Math.trunc(diff.right / props.drawing.pixelSize), 0),
      }
    }

    if (fix) {
      updateProject({type: "resizeDrawing", drawingId: props.drawing.id, rect: newMask})
      setMask(null)
      setPanelPositionOffset([0, 0])
    } else if (mask === null ||
      newMask.start.rowIndex !== mask.start.rowIndex ||
      newMask.start.columnIndex !== mask.start.columnIndex ||
      newMask.end.rowIndex !== mask.end.rowIndex ||
      newMask.end.columnIndex !== mask.end.columnIndex) {
      setMask(newMask)
      setPanelPositionOffset([newMask.start.columnIndex * props.drawing.pixelSize, newMask.start.rowIndex * props.drawing.pixelSize])
    }
  }

  return (
    <ResizableArea onResize={onResize}>
      <Canvas
        drawing={props.drawing}
        mask={mask ?? undefined}
      />
    </ResizableArea>
  )
}
