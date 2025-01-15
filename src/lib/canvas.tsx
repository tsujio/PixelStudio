import React from "react"
import { Color } from "./color"

export const getEventPosition = (e: React.MouseEvent | MouseEvent, canvas: HTMLCanvasElement): [number, number] => {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  return [x, y]
}

export const convertToGridIndices = (x: number, y: number, pixelSize: number): [number, number] => {
  const columnIndex = Math.floor(x / pixelSize)
  const rowIndex = Math.floor(y / pixelSize)
  return [rowIndex, columnIndex]
}

export const interpolateEventPositions = ([x, y]: [number, number], [prevX, prevY]: [number, number], pixelSize: number) => {
  const indices: [number, number][] = []
  const [vx, vy] = [x - prevX, y - prevY]
  const norm = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2))
  const [nvx, nvy] = [vx / norm, vy / norm]
  for (let i = 1; i <= norm / pixelSize; i++) {
    const [px, py] = [prevX + nvx * pixelSize * i, prevY + nvy * pixelSize * i]
    const [rowIndex, columnIndex] = convertToGridIndices(px, py, pixelSize)
    indices.push([rowIndex, columnIndex])
  }
  const [rowIndex, columnIndex] = convertToGridIndices(x, y, pixelSize)
  indices.push([rowIndex, columnIndex])
  return indices
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

export const drawPixels = (ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, canvas: HTMLCanvasElement | OffscreenCanvas, data: (Color | null)[][], pixelSize: number) => {
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      if (data[i][j] !== null) {
        ctx.fillStyle = data[i][j]!.rgb
        ctx.fillRect(pixelSize * j, pixelSize * i, pixelSize, pixelSize)
      }
    }
  }
}

export const drawSelectArea = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, start: {rowIndex: number, columnIndex: number}, end: {rowIndex: number, columnIndex: number}, pixelSize: number) => {
  const top = Math.min(start.rowIndex, end.rowIndex)
  const left = Math.min(start.columnIndex, end.columnIndex)
  const height = Math.max(start.rowIndex, end.rowIndex) - top + 1
  const width = Math.max(start.columnIndex, end.columnIndex) - left + 1
  ctx.strokeStyle = "green"
  ctx.strokeRect(pixelSize * left, pixelSize * top, pixelSize * width, pixelSize * height)
}
