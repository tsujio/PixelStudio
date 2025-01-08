import React, { useEffect, useRef } from 'react'
import Drawing from 'tsx!lib/drawing'

type Props = {
  drawing: Drawing
  pixelSize: number
  saving: boolean
  onMouseDown: (drawingId: string, columnIndex: number, rowIndex: number) => void
  onDataURLGenerate: (url: string) => void
}

export default function Canvas(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const canvasWidth = props.pixelSize * props.drawing.columnCount
  const canvasHeight = props.pixelSize * props.drawing.rowCount

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      ctx.clearRect(0, 0, canvasWidth, canvasHeight)

      // Draw grid lines
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
    }
  }, [canvasRef.current, props.pixelSize, props.drawing.rowCount, props.drawing.columnCount, props.drawing.data])

  useEffect(() => {
    if (props.saving) {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const url = canvas.toDataURL()
        props.onDataURLGenerate(url)
      }
    }
  }, [props.saving])

  const onMouseDown = (e: any) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const columnIndex = Math.floor(x / props.pixelSize)
      const rowIndex = Math.floor(y / props.pixelSize)
      props.onMouseDown(props.drawing.id, columnIndex, rowIndex)
    }
  }

  return <>
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onMouseDown={onMouseDown}
    ></canvas>
  </>
}
