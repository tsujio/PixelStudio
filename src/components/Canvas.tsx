import { useRef, useEffect } from "react"
import { useProjectContext } from "./ProjectContext"
import { useDrawContext } from "./DrawContext"
import { Drawing } from "../lib/drawing"
import {
  getEventPosition,
  convertToGridIndices,
  interpolateEventPositions,
  clearCanvas,
  drawGridLines,
  drawPixels,
  drawSelectArea,
} from "../lib/canvas"

type Props = {
  drawing: Drawing
  pixelSize: number
}

export function Canvas(props: Props) {
  const { updateProject } = useProjectContext()

  const { drawContext, startSelectArea, expandSelectArea } = useDrawContext()

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const canvasWidth = props.pixelSize * props.drawing.columnCount
  const canvasHeight = props.pixelSize * props.drawing.rowCount

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx === null) {
        throw new Error("Failed to get canvas rendering context")
      }

      clearCanvas(ctx, canvas)
      drawGridLines(ctx, canvas, props.drawing.rowCount, props.drawing.columnCount, props.pixelSize)
      drawPixels(ctx, canvas, props.drawing.data, props.pixelSize)
      if (drawContext.select.area !== undefined && drawContext.select.area.drawingId === props.drawing.id) {
        drawSelectArea(ctx, canvas, drawContext.select.area.start, drawContext.select.area.end, props.pixelSize)
      }
    }
  }, [canvasRef.current, props.pixelSize, props.drawing.rowCount, props.drawing.columnCount, props.drawing.data, drawContext.select.area])

  const mousePositionRef = useRef<[number, number] | null>(null)

  const onMouseDown = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      const [x, y] = getEventPosition(e, canvasRef.current)
      mousePositionRef.current = [x, y]
      const [rowIndex, columnIndex] = convertToGridIndices(x, y, props.pixelSize)

      if (props.drawing.isValidIndices(rowIndex, columnIndex)) {
        switch (drawContext.tool) {
          case "pen":
            updateProject({type: "setPixel", drawingId: props.drawing.id, rowIndex, columnIndex, color: drawContext.pen.color})
            break
          case "eraser":
            updateProject({type: "clearPixel", drawingId: props.drawing.id, rowIndex, columnIndex})
            break
          case "select":
            startSelectArea(props.drawing.id, rowIndex, columnIndex)
            break
        }
      }

      const onMouseMove = (e: MouseEvent) => {
        if (canvasRef.current && mousePositionRef.current) {
          const [prevX, prevY] = mousePositionRef.current
          const [x, y] = getEventPosition(e, canvasRef.current)
          if (x === prevX && y === prevY) {
            return
          }
          mousePositionRef.current = [x, y]

          const indices = interpolateEventPositions([x, y], [prevX, prevY], props.pixelSize)
          indices.forEach(([rowIndex, columnIndex]) => {
            if (props.drawing.isValidIndices(rowIndex, columnIndex)) {
              switch (drawContext.tool) {
                case "pen":
                  updateProject({type: "setPixel", drawingId: props.drawing.id, rowIndex, columnIndex, color: drawContext.pen.color})
                  break
                case "eraser":
                  updateProject({type: "clearPixel", drawingId: props.drawing.id, rowIndex, columnIndex})
                  break
                case "select":
                  expandSelectArea(props.drawing.id, rowIndex, columnIndex)
                  break
              }
            }
          })
        }
      }

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
      }

      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onMouseDown={onMouseDown}
      style={{
        display: "block",
        border: "1px solid gray",
      }}
    />
  )
}
