import { useRef, useEffect, useState } from "react"
import { useDrawContext } from "./DrawContext"
import { RGBColor, HSVColor } from "../lib/color"
import { convertToDrawingDataPosition, getEventPosition } from "../lib/canvas"

export function ColorPicker() {
  const { drawContext, changePenColor } = useDrawContext()

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx === null) {
        return
      }

      const hsvColor = drawContext.pen.color.toHSV()
      const hsv = hsvColor.hsv

      // Draw color grid
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < 100; i++) {
        for (let j = 0; j < 100; j++) {
          ctx.fillStyle = new HSVColor([hsv[0], i, 100 - j]).css
          ctx.fillRect(2 * i, 2 * j, 2, 2)
        }
      }

      // Draw selector
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
      ctx.fillStyle = hsvColor.css
      ctx.fill()
    }
  }, [drawContext.pen.color])

  const onHueSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hsv = drawContext.pen.color.toHSV().hsv
    const color = new HSVColor([parseInt(e.target.value), hsv[1], hsv[2]])
    changePenColor(color)
  }

  const hueCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (hueCanvasRef.current) {
      const canvas = hueCanvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx === null) {
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < 360; i++) {
        ctx.fillStyle = new HSVColor([i, 100, 100]).css
        ctx.fillRect(i, 0, 1, 20)
      }

      const hue = drawContext.pen.color.toHSV().hsv[0]
      // Draw selector
      ctx.fillStyle = "black"
      ctx.fillRect(hue - 3, 0, 6, 20)
      ctx.fillStyle = "white"
      ctx.fillRect(hue - 2, 0, 4, 20)
      ctx.fillStyle = new HSVColor([hue, 100, 100]).css
      ctx.fillRect(hue - 1, 0, 2, 20)
    }
  }, [drawContext.pen.color])

  const setHueOfEventPosition = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      const [x, y] = getEventPosition(e, canvasRef.current)
      const {columnIndex} = convertToDrawingDataPosition(x, y, 1)
      const hsv = drawContext.pen.color.toHSV().hsv
      const color = new HSVColor([columnIndex, hsv[1], hsv[2]])
      changePenColor(color)
    }
  }

  const [hueCanvasDragging, setHueCanvasDragging] = useState(false)
  const onMouseDownOnHueCanvas = (e: React.MouseEvent) => {
    setHueOfEventPosition(e)
    setHueCanvasDragging(true)
  }

  const onMouseMoveOnHueCanvas = (e: React.MouseEvent) => {
    if (hueCanvasDragging) {
      setHueOfEventPosition(e)
    }
  }

  const onMouseUpOnHueCanvas = () => {
    setHueCanvasDragging(false)
  }

  const setPenColorOfEventPosition = (e: React.MouseEvent) => {
    if (canvasRef.current) {
      const [x, y] = getEventPosition(e, canvasRef.current)
      const {rowIndex, columnIndex} = convertToDrawingDataPosition(x, y, 2)
      const h = drawContext.pen.color.toHSV().hsv[0]
      const color = new HSVColor([h, columnIndex, 100 - rowIndex])
      changePenColor(color)
    }
  }

  const [dragging, setDragging] = useState(false)
  const onMouseDown = (e: React.MouseEvent) => {
    setPenColorOfEventPosition(e)
    setDragging(true)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      setPenColorOfEventPosition(e)
    }
  }

  const onMouseUp = () => {
    setDragging(false)
  }

  const onColorElementValueChange = (type: "rgb" | "hsv") => (index: 0 | 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    switch (type) {
      case "rgb": {
        const rgb = drawContext.pen.color.toRGB().rgb
        rgb[index] = value
        changePenColor(new RGBColor(rgb))
        break
      }
      case "hsv": {
        const hsv = drawContext.pen.color.toHSV().hsv
        hsv[index] = value
        changePenColor(new HSVColor(hsv))
        break
      }
    }
  }

  const rgb = drawContext.pen.color.toRGB().rgb
  const hsv = drawContext.pen.color.toHSV().hsv

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      <div>
        {false && <input type="number" value={hsv[0]} onChange={onHueSliderChange} />}
        <canvas
          ref={hueCanvasRef}
          width={360}
          height={20}
          onMouseDown={onMouseDownOnHueCanvas}
          onMouseMove={onMouseMoveOnHueCanvas}
          onMouseUp={onMouseUpOnHueCanvas}
        />
        <canvas
          ref={canvasRef}
          width={2*100}
          height={2*100}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        />
      </div>
      <div style={{display: "grid", gridTemplateColumns: "30px 1fr"}}>
        <div>R</div>
        <div><input type="number" value={rgb[0]} onChange={onColorElementValueChange("rgb")(0)} /></div>
        <div>G</div>
        <div><input type="number" value={rgb[1]} onChange={onColorElementValueChange("rgb")(1)} /></div>
        <div>B</div>
        <div><input type="number" value={rgb[2]} onChange={onColorElementValueChange("rgb")(2)} /></div>
        <div>H</div>
        <div><input type="number" value={hsv[0]} onChange={onColorElementValueChange("hsv")(0)} /></div>
        <div>S</div>
        <div><input type="number" value={hsv[1]} onChange={onColorElementValueChange("hsv")(1)} /></div>
        <div>V</div>
        <div><input type="number" value={hsv[2]} onChange={onColorElementValueChange("hsv")(2)} /></div>
      </div>
    </div>
  )
}
