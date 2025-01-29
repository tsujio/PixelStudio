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
import { useGesture } from "../lib/gesture"
import { useBoardContext } from "./Board"

type Props = {
  drawing: Drawing
  mask?: DrawingDataRect
}

export function Canvas(props: Props) {
  const { updateProject } = useProjectContext()

  const { drawContext, startSelectArea, expandSelectArea } = useDrawContext()

  const { boardNavigation } = useBoardContext()

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const pixelSize = props.drawing.pixelSize * boardNavigation.zoom

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
      drawGridLines(ctx, canvas, data.length, data[0].length, pixelSize)
      drawPixels(ctx, canvas, data, pixelSize)
      if (drawContext.select.area !== undefined && drawContext.select.area.drawingId === props.drawing.id) {
        drawSelectArea(ctx, canvas, drawContext.select.area.rect, pixelSize)
      }
    }
  }, [
    pixelSize,
    data,
    props.drawing.id,
    drawContext.select.area,
  ])

  const gestureHandlers = useGesture({
    onDragStart: e => {
      if (!canvasRef.current) {
        return
      }

      const chainId = crypto.randomUUID()

      const [x, y] = getEventPosition(e, canvasRef.current)
      const position = convertToDrawingDataPosition(x, y, pixelSize)

      if (props.drawing.isValidPosition(position)) {
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
      }

      return {chainId, x, y}
    },
    onDragMove: (e, dragStartData, prevDragMoveData: [number, number] | undefined): [number, number] => {
      if (!canvasRef.current || !dragStartData) {
        return [NaN, NaN]
      }

      const [x, y] = getEventPosition(e, canvasRef.current)

      const [prevX, prevY] = prevDragMoveData ?? [dragStartData.x, dragStartData.y]
      if (isNaN(prevX) || isNaN(prevY) || (x === prevX && y === prevY)) {
        return [x, y]
      }

      const positions = interpolateEventPositions([x, y], [prevX, prevY], pixelSize)
      positions.forEach(position => {
        switch (drawContext.tool) {
          case "pen":
          case "eraser": {
            if (props.drawing.isValidPosition(position)) {
              const color = drawContext.tool === "pen" ? drawContext.pen.color : null
              updateProject({type: "setPixel", drawingId: props.drawing.id, position, color, chainId: dragStartData.chainId})
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

      return [x, y]
    }
  })

  const canvasWidth = pixelSize * data[0].length
  const canvasHeight = pixelSize * data.length

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      {...gestureHandlers}
      style={{
        display: "block",
        border: `${1 * boardNavigation.zoom}px solid gray`,
      }}
    />
  )
}
