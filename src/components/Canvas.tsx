import { useRef, useEffect, useMemo } from "react"
import { useProjectContext } from "./ProjectContext"
import { useDrawContext } from "./DrawContext"
import { Drawing, DrawingDataRect } from "../lib/drawing"
import {
  getEventPosition,
  convertToDrawingDataPosition,
  interpolateEventPositions,
  clearCanvas,
  drawGridLines,
  drawPixels,
  drawSelectArea,
  applyMask,
} from "../lib/canvas"

type Props = {
  drawing: Drawing
  mask?: DrawingDataRect
}

export function Canvas(props: Props) {
  const { updateProject } = useProjectContext()

  const { drawContext, startSelectArea, expandSelectArea } = useDrawContext()

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const data = useMemo(() => {
    if (props.mask === undefined) {
      return props.drawing.data
    }
    return applyMask(props.drawing.data, props.mask)
  }, [props.drawing.data, props.mask])

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx === null) {
        throw new Error("Failed to get canvas rendering context")
      }

      clearCanvas(ctx, canvas)
      drawGridLines(ctx, canvas, data.length, data[0].length, props.drawing.pixelSize)
      drawPixels(ctx, canvas, data, props.drawing.pixelSize)
      if (drawContext.select.area !== undefined && drawContext.select.area.drawingId === props.drawing.id) {
        drawSelectArea(ctx, canvas, drawContext.select.area.rect, props.drawing.pixelSize)
      }
    }
  }, [
    props.drawing.pixelSize,
    data,
    props.drawing.id,
    drawContext.select.area,
  ])

  const mousePositionRef = useRef<[number, number] | null>(null)

  const onMouseDown = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      const [x, y] = getEventPosition(e, canvasRef.current)
      mousePositionRef.current = [x, y]
      const position = convertToDrawingDataPosition(x, y, props.drawing.pixelSize)

      if (!props.drawing.isValidPosition(position)) {
        return
      }

      const chainId = crypto.randomUUID()

      switch (drawContext.tool) {
        case "pen":
        case "eraser": {
          const color = drawContext.tool === "pen" ? drawContext.pen.color : null
          updateProject({type: "setPixel", drawingId: props.drawing.id, position, color, chainId})
          break
        }
        case "select":
          startSelectArea(props.drawing.id, position)
          break
      }

      const onMouseMove = (e: MouseEvent) => {
        if (canvasRef.current && mousePositionRef.current) {
          const [prevX, prevY] = mousePositionRef.current
          const [x, y] = getEventPosition(e, canvasRef.current)
          if (x === prevX && y === prevY) {
            return
          }
          mousePositionRef.current = [x, y]

          const positions = interpolateEventPositions([x, y], [prevX, prevY], props.drawing.pixelSize)
          positions.forEach(position => {
            switch (drawContext.tool) {
              case "pen":
              case "eraser": {
                if (props.drawing.isValidPosition(position)) {
                  const color = drawContext.tool === "pen" ? drawContext.pen.color : null
                  updateProject({type: "setPixel", drawingId: props.drawing.id, position, color, chainId})
                }
                break
              }
              case "select": {
                const ri = Math.min(Math.max(position.rowIndex, 0), props.drawing.rowCount - 1)
                const ci = Math.min(Math.max(position.columnIndex, 0), props.drawing.columnCount - 1)
                expandSelectArea(props.drawing.id, {rowIndex: ri, columnIndex: ci})
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

  const canvasWidth = props.drawing.pixelSize * data[0].length
  const canvasHeight = props.drawing.pixelSize * data.length

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
