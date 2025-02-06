import { useRef, useEffect } from "react"
import { HSVColor } from "../lib/color"
import { convertToDrawingDataPosition, getEventPosition } from "../lib/canvas"
import { Color } from "../lib/color"
import { useGesture } from "./GestureContext"

type Props = {
  color: Color
  onColorPick: (color: Color) => void
}

export function HSVColorPicker(props: Props) {
  const hsv = props.color.toHSV().hsv

  const hueCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (hueCanvasRef.current) {
      const canvas = hueCanvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx === null) {
        return
      }

      // Draw hue lines
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < 360; i++) {
        ctx.fillStyle = new HSVColor([i, 100, 100]).css
        ctx.fillRect(i, 0, 1, canvas.height)
      }

      // Draw selector
      const x = hsv[0]
      ctx.fillStyle = "black"
      ctx.fillRect(x - 6, 0, 12, canvas.height)
      ctx.fillStyle = "white"
      ctx.fillRect(x - 4, 0, 8, canvas.height)
      ctx.fillStyle = new HSVColor([hsv[0], 100, 100]).css
      ctx.fillRect(x - 2, 0, 4, canvas.height)
    }
  }, [hsv[0]])

  const hueCanvasGestureHandlers = useGesture({
    onDragStart: e => {
      const onChange = (e: React.PointerEvent) => {
        if (hueCanvasRef.current) {
          const rect = hueCanvasRef.current.getBoundingClientRect()
          const [x, y] = getEventPosition(e, hueCanvasRef.current)
          const {columnIndex} = convertToDrawingDataPosition(x, y, rect.width / hueCanvasRef.current.width)
          const hue = Math.min(Math.max(columnIndex, 0), 360)
          const color = new HSVColor([hue, hsv[1], hsv[2]])
          props.onColorPick(color)
        }
      }

      onChange(e)

      return onChange
    },
    onDragMove: (e, onChange) => {
      onChange(e)
    }
  })

  const svCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (svCanvasRef.current) {
      const canvas = svCanvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx === null) {
        return
      }

      // Draw sv grid
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 100; j++) {
          ctx.fillStyle = new HSVColor([hsv[0], i, 100 - j]).css
          ctx.fillRect(i, j, 1, 1)
        }
      }

      // Draw sv selector
      ctx.beginPath()
      const x = hsv[1]
      const y = (100 - hsv[2])
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = "black"
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fillStyle = "white"
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, 2 * Math.PI)
      ctx.fillStyle = new HSVColor([hsv[0], hsv[1], hsv[2]]).css
      ctx.fill()
    }
  }, [hsv[0], hsv[1], hsv[2]])

  const svCanvasGestureHandlers = useGesture({
    onDragStart: e => {
      const onChange = (e: React.PointerEvent | PointerEvent) => {
        if (svCanvasRef.current) {
          const [x, y] = getEventPosition(e, svCanvasRef.current)
          const {rowIndex, columnIndex} = convertToDrawingDataPosition(x, y, 2)
          const s = Math.min(Math.max(columnIndex, 0), 100)
          const v = Math.min(Math.max(100 - rowIndex, 0), 100)
          const color = new HSVColor([hsv[0], s, v])
          props.onColorPick(color)
        }
      }

      onChange(e)

      return onChange
    },
    onDragMove: (e, onChange) => {
      onChange(e)
    }
  })

  return (
    <div>
      <canvas
        ref={hueCanvasRef}
        width={360}
        height={1}
        {...hueCanvasGestureHandlers}
        style={{
          display: "block",
          width: "100%",
          height: "20px",
        }}
      />
      <canvas
        ref={svCanvasRef}
        width={100}
        height={100}
        {...svCanvasGestureHandlers}
        style={{
          display: "block",
          width: "100%",
          marginTop: "8px",
        }}
      />
    </div>
  )
}
