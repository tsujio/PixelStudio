import React, { useEffect, useRef } from 'react'
import Drawing from 'tsx!lib/drawing'
import { useProjectContext } from 'tsx!component/ProjectContext'
import { useDrawContext } from 'tsx!component/DrawContext'
import ResizableContainer from 'tsx!component/ResizableContainer'
import { useWindowContext } from 'tsx!component/Window'

type Props = {
  drawing: Drawing
  pixelSize: number
  saving: boolean
}

export default function Canvas(props: Props) {
  const { setWindowName } = useWindowContext()
  useEffect(() => {
    setWindowName(props.drawing.name)
  }, [props.drawing.name])

  const { updateProject } = useProjectContext()

  const { drawContext, updateDrawContext } = useDrawContext()

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const canvasWidth = props.pixelSize * props.drawing.columnCount
  const canvasHeight = props.pixelSize * props.drawing.rowCount

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)

      // Draw grid lines
      ctx.strokeStyle = "gray"
      for (let i = 0; i < props.drawing.rowCount - 1; i++) {
        const y = props.pixelSize * (i + 1)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvasWidth, y)
        ctx.stroke()
      }
      for (let i = 0; i < props.drawing.columnCount - 1; i++) {
        const x = props.pixelSize * (i + 1)
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvasHeight)
        ctx.stroke()
      }

      // Fill pixels
      for (let i = 0; i < props.drawing.data.length; i++) {
        for (let j = 0; j < props.drawing.data[i].length; j++) {
          if (props.drawing.data[i][j]) {
            ctx.fillStyle = props.drawing.data[i][j].rgb
            ctx.fillRect(props.pixelSize * j, props.pixelSize * i, props.pixelSize, props.pixelSize)
          }
        }
      }

      // Show selected area
      if (drawContext.select && drawContext.select.drawingId === props.drawing.id) {
        const { start, end } = drawContext.select
        const top = Math.min(start.rowIndex, end.rowIndex)
        const left = Math.min(start.columnIndex, end.columnIndex)
        const height = Math.max(start.rowIndex, end.rowIndex) - top + 1
        const width = Math.max(start.columnIndex, end.columnIndex) - left + 1
        ctx.strokeStyle = "green"
        ctx.strokeRect(props.pixelSize * left, props.pixelSize * top, props.pixelSize * width, props.pixelSize * height)
      }
    }
  }, [canvasRef.current, props.pixelSize, props.drawing.rowCount, props.drawing.columnCount, props.drawing.data, drawContext.select])

  const mousePositionRef = useRef<[number, number] | null>(null)

  const onMouseDown = (e: any) => {
    const getEventPosition = (e: any, canvas: HTMLCanvasElement): [number, number] => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      return [x, y]
    }

    const convertToGridIndices = (x: number, y: number): [number, number] => {
      const columnIndex = Math.floor(x / props.pixelSize)
      const rowIndex = Math.floor(y / props.pixelSize)
      return [rowIndex, columnIndex]
    }

    if (canvasRef.current) {
      const [x, y] = getEventPosition(e, canvasRef.current)
      mousePositionRef.current = [x, y]
      const [rowIndex, columnIndex] = convertToGridIndices(x, y)

      switch (drawContext.tool) {
        case "pen":
          updateProject({type: "setPixel", drawingId: props.drawing.id, rowIndex, columnIndex, color: drawContext.color})
          break
        case "eraser":
          updateProject({type: "clearPixel", drawingId: props.drawing.id, rowIndex, columnIndex})
          break
        case "select":
          updateDrawContext({type: "startSelect", drawingId: props.drawing.id, rowIndex, columnIndex})
          break
      }

      const onMouseMove = (e: any) => {
        if (canvasRef.current) {
          const [prevX, prevY] = mousePositionRef.current
          const [x, y] = getEventPosition(e, canvasRef.current)

          if (x === prevX && y === prevY) {
            return
          }

          mousePositionRef.current = [x, y]

          // Interpolate
          const indices: [number, number][] = []
          const [vx, vy] = [x - prevX, y - prevY]
          const norm = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2))
          const [nvx, nvy] = [vx / norm, vy / norm]
          for (let i = 1; i <= norm / props.pixelSize; i++) {
            const [px, py] = [prevX + nvx * props.pixelSize * i, prevY + nvy * props.pixelSize * i]
            const [rowIndex, columnIndex] = convertToGridIndices(px, py)
            indices.push([rowIndex, columnIndex])
          }
          const [rowIndex, columnIndex] = convertToGridIndices(x, y)
          indices.push([rowIndex, columnIndex])

          switch (drawContext.tool) {
            case "pen":
              indices.forEach(([rowIndex, columnIndex]) => {
                updateProject({type: "setPixel", drawingId: props.drawing.id, rowIndex, columnIndex, color: drawContext.color})
              })
              break
            case "eraser":
              indices.forEach(([rowIndex, columnIndex]) => {
                updateProject({type: "clearPixel", drawingId: props.drawing.id, rowIndex, columnIndex})
              })
              break
            case "select":
              updateDrawContext({type: "expandSelect", drawingId: props.drawing.id, rowIndex, columnIndex})
              break
          }
        }
      }

      const onMouseUp = (e: any) => {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)
      }

      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    }
  }

  return <>
    <ResizableContainer>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={onMouseDown}
        style={{
          display: "block",
          border: "1px solid gray",
        }}
      ></canvas>
    </ResizableContainer>
  </>
}
