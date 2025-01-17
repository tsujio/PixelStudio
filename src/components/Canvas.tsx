import { useRef, useEffect, useMemo } from "react"
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
  applyMask,
} from "../lib/canvas"

type Props = {
  drawing: Drawing
  pixelSize: number
  mask?: {
    start: {
      rowIndex: number
      columnIndex: number
    },
    end: {
      rowIndex: number
      columnIndex: number
    }
  }
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
      drawGridLines(ctx, canvas, data.length, data[0].length, props.pixelSize)
      drawPixels(ctx, canvas, data, props.pixelSize)
      if (drawContext.select.area !== undefined && drawContext.select.area.drawingId === props.drawing.id) {
        drawSelectArea(ctx, canvas, drawContext.select.area.start, drawContext.select.area.end, props.pixelSize)
      }
    }
  }, [
    props.pixelSize,
    data,
    props.drawing.id,
    drawContext.select.area,
  ])

  const mousePositionRef = useRef<[number, number] | null>(null)

  const onMouseDown = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      const [x, y] = getEventPosition(e, canvasRef.current)
      mousePositionRef.current = [x, y]
      const [rowIndex, columnIndex] = convertToGridIndices(x, y, props.pixelSize)

      if (!props.drawing.isValidIndices(rowIndex, columnIndex)) {
        return
      }

      const chainId = crypto.randomUUID()

      switch (drawContext.tool) {
        case "pen":
        case "eraser": {
          const color = drawContext.tool === "pen" ? drawContext.pen.color : null
          updateProject({type: "setPixel", drawingId: props.drawing.id, rowIndex, columnIndex, color, chainId})
          break
        }
        case "select":
          startSelectArea(props.drawing.id, rowIndex, columnIndex)
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

          const indices = interpolateEventPositions([x, y], [prevX, prevY], props.pixelSize)
          indices.forEach(([rowIndex, columnIndex]) => {
            switch (drawContext.tool) {
              case "pen":
              case "eraser": {
                if (props.drawing.isValidIndices(rowIndex, columnIndex)) {
                  const color = drawContext.tool === "pen" ? drawContext.pen.color : null
                  updateProject({type: "setPixel", drawingId: props.drawing.id, rowIndex, columnIndex, color, chainId})
                }
                break
              }
              case "select": {
                const ri = Math.min(Math.max(rowIndex, 0), props.drawing.rowCount - 1)
                const ci = Math.min(Math.max(columnIndex, 0), props.drawing.columnCount - 1)
                expandSelectArea(props.drawing.id, ri, ci)
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

  const canvasWidth = props.pixelSize * data[0].length
  const canvasHeight = props.pixelSize * data.length

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
