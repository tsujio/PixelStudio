import React from "react"
import { DrawingData, DrawingDataPosition, DrawingDataRect } from "./drawing"

export const getEventPosition = (e: React.MouseEvent | MouseEvent, canvas: HTMLCanvasElement): [number, number] => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  return [x, y]
}

export const convertToDrawingDataPosition = (x: number, y: number, pixelSize: number): DrawingDataPosition => {
  const columnIndex = Math.trunc(x / pixelSize)
  const rowIndex = Math.trunc(y / pixelSize)
  return {rowIndex, columnIndex}
}

export const interpolateEventPositions = ([x, y]: [number, number], [prevX, prevY]: [number, number], pixelSize: number) => {
  const positions: DrawingDataPosition[] = []
  const [vx, vy] = [x - prevX, y - prevY]
  const norm = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2))
  const [nvx, nvy] = [vx / norm, vy / norm]
  for (let i = 1; i <= norm / pixelSize; i++) {
    const [px, py] = [prevX + nvx * pixelSize * i, prevY + nvy * pixelSize * i]
    const pos = convertToDrawingDataPosition(px, py, pixelSize)
    positions.push(pos)
  }
  const pos = convertToDrawingDataPosition(x, y, pixelSize)
  positions.push(pos)
  return positions
}

export const applyMask = (data: DrawingData, mask: DrawingDataRect) => {
  const [ rowCount, columnCount ] = [data.length, data[0].length]
  const { start, end } = mask

  if (start.rowIndex > 0) {
    data = data.slice(start.rowIndex)
  }
  if (start.rowIndex < 0) {
    data = [...Array(-start.rowIndex)].map(() => Array(data[0].length).fill(null)).concat(data)
  }
  if (start.columnIndex > 0) {
    data = data.map(row => row.slice(start.columnIndex))
  }
  if (start.columnIndex < 0) {
    data = data.map(row => Array(-start.columnIndex).fill(null).concat(row))
  }
  if (end.rowIndex > rowCount - 1) {
    data = data.concat([...Array(end.rowIndex - (rowCount - 1))].map(() => Array(data[0].length).fill(null)))
  }
  if (end.rowIndex < rowCount - 1) {
    data = data.slice(0, data.length - ((rowCount - 1) - end.rowIndex))
  }
  if (end.columnIndex > columnCount - 1) {
    data = data.map(row => row.concat(Array(end.columnIndex - (columnCount - 1)).fill(null)))
  }
  if (end.columnIndex < columnCount - 1) {
    data = data.map(row => row.slice(0, data[0].length - ((columnCount - 1) - end.columnIndex)))
  }

  return data
}

export const clearCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

export const drawGridLines = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, rowCount: number, columnCount: number, pixelSize: number) => {
  ctx.strokeStyle = "gray"
  for (let i = 0; i < rowCount - 1; i++) {
    const y = pixelSize * (i + 1)
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }
  for (let i = 0; i < columnCount - 1; i++) {
    const x = pixelSize * (i + 1)
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()
  }
}

export const drawPixels = (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, _: HTMLCanvasElement | OffscreenCanvas, data: DrawingData, pixelSize: number) => {
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      if (data[i][j] !== null) {
        ctx.fillStyle = data[i][j]!.rgb
        ctx.fillRect(pixelSize * j, pixelSize * i, pixelSize, pixelSize)
      }
    }
  }
}

export const drawSelectArea = (ctx: CanvasRenderingContext2D, _: HTMLCanvasElement, rect: DrawingDataRect, pixelSize: number) => {
  const {start, end} = rect
  const top = Math.min(start.rowIndex, end.rowIndex)
  const left = Math.min(start.columnIndex, end.columnIndex)
  const height = Math.max(start.rowIndex, end.rowIndex) - top + 1
  const width = Math.max(start.columnIndex, end.columnIndex) - left + 1
  ctx.strokeStyle = "green"
  ctx.strokeRect(pixelSize * left, pixelSize * top, pixelSize * width, pixelSize * height)
}
