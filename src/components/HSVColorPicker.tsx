import { useRef, useEffect } from "react"
import { HSVColor } from "../lib/color"
import { convertToDrawingDataPosition, getEventPosition } from "../lib/canvas"
import { Color } from "../lib/color"

const hueSteps = 180

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
      for (let i = 0; i < hueSteps; i++) {
        ctx.fillStyle = new HSVColor([i * 360 / hueSteps, 100, 100]).css
        ctx.fillRect(i, 0, 1, canvas.height)
      }

      // Draw selector
      const x = hsv[0] * hueSteps / 360
      ctx.fillStyle = "black"
      ctx.fillRect(x - 3, 0, 6, canvas.height)
      ctx.fillStyle = "white"
      ctx.fillRect(x - 2, 0, 4, canvas.height)
      ctx.fillStyle = new HSVColor([hsv[0], 100, 100]).css
      ctx.fillRect(x - 1, 0, 2, canvas.height)
    }
  }, [hsv[0]])

  const onMouseDownOnHueCanvas = (e: React.MouseEvent) => {
    const onChange = (e: React.MouseEvent | MouseEvent) => {
      if (hueCanvasRef.current) {
        const [x, y] = getEventPosition(e, hueCanvasRef.current)
        const {columnIndex} = convertToDrawingDataPosition(x, y, 1)
        const hue = Math.round(Math.min(Math.max(columnIndex, 0), hueSteps) * 360 / hueSteps)
        const color = new HSVColor([hue, hsv[1], hsv[2]])
        props.onColorPick(color)
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      onChange(e)
    }
  
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)

    onChange(e)
  }

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
          ctx.fillRect(2 * i, 2 * j, 2, 2)
        }
      }

      // Draw sv selector
      ctx.beginPath()
      const x = hsv[1] * 2
      const y = (100 - hsv[2]) * 2
      ctx.arc(x, y, 8, 0, 2 * Math.PI)
      ctx.fillStyle = "black"
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, 2 * Math.PI)
      ctx.fillStyle = "white"
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fillStyle = new HSVColor([hsv[0], hsv[1], hsv[2]]).css
      ctx.fill()
    }
  }, [hsv[0], hsv[1], hsv[2]])

  const onMouseDownOnSVCanvas = (e: React.MouseEvent) => {
    const onChange = (e: React.MouseEvent | MouseEvent) => {
      if (svCanvasRef.current) {
        const [x, y] = getEventPosition(e, svCanvasRef.current)
        const {rowIndex, columnIndex} = convertToDrawingDataPosition(x, y, 2)
        const s = Math.min(Math.max(columnIndex, 0), 100)
        const v = Math.min(Math.max(100 - rowIndex, 0), 100)
        const color = new HSVColor([hsv[0], s, v])
        props.onColorPick(color)
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      onChange(e)
    }

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)

    onChange(e)
  }

  return (
    <div>
      <div>
        <canvas
          ref={hueCanvasRef}
          width={hueSteps}
          height={20}
          onMouseDown={onMouseDownOnHueCanvas}
          style={{
            display: "block",
          }}
        />
      </div>
      <div style={{marginTop: "8px"}}>
        <canvas
          ref={svCanvasRef}
          width={2 * 100}
          height={2 * 100}
          onMouseDown={onMouseDownOnSVCanvas}
          style={{
            display: "block",
          }}
        />
      </div>
    </div>
  )
}
