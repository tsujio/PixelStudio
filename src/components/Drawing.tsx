import { useEffect, useState, useRef } from "react"
import { useWindowContext } from "./Window"
import { useWindowSystemContext } from "./WindowSystem"
import { useProjectContext } from "./ProjectContext"
import { Canvas } from "./Canvas"
import { ResizableArea } from "./ResizableArea"
import { Drawing as DrawingClass, DrawingDataRect } from "../lib/drawing"

type Props = {
  drawing: DrawingClass
}

export function Drawing(props: Props) {
  const { windowId, setWindowName } = useWindowContext()
  const { windows, moveWindow } = useWindowSystemContext()
  const { updateProject } = useProjectContext()

  const [mask, setMask] = useState<DrawingDataRect | null>(null)

  const rowCount = mask ? mask.end.rowIndex - mask.start.rowIndex + 1 : props.drawing.rowCount
  const columnCount = mask ? mask.end.columnIndex - mask.start.columnIndex + 1 : props.drawing.columnCount

  useEffect(() => {
    setWindowName(`${props.drawing.name} (${rowCount} x ${columnCount})`)
  }, [setWindowName, props.drawing.name, rowCount, columnCount])

  const windowPositionBeforeResizeRef = useRef<[number, number] | null>(null)
  const onResizeStart = () => {
    const window = windows[windowId]
    windowPositionBeforeResizeRef.current = [window.top, window.left]
  }

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
    } else if (mask === null ||
      newMask.start.rowIndex !== mask.start.rowIndex ||
      newMask.start.columnIndex !== mask.start.columnIndex ||
      newMask.end.rowIndex !== mask.end.rowIndex ||
      newMask.end.columnIndex !== mask.end.columnIndex) {
      setMask(newMask)
    }

    if (windowPositionBeforeResizeRef.current) {
      const top = windowPositionBeforeResizeRef.current[0] + newMask.start.rowIndex * props.drawing.pixelSize
      const left = windowPositionBeforeResizeRef.current[1] + newMask.start.columnIndex * props.drawing.pixelSize
      moveWindow(windowId, top, left)
    }
  }

  return (
    <ResizableArea onResizeStart={onResizeStart} onResize={onResize}>
      <Canvas
        drawing={props.drawing}
        mask={mask ?? undefined}
      />
    </ResizableArea>
  )
}
