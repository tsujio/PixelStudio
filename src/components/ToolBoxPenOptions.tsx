import { useDrawContext } from "./DrawContext"
import { ColorPicker } from "./ColorPicker"
import { RGBColor } from "../lib/color"

export function ToolBoxPenOptions() {
  const { drawContext, changePenColor } = useDrawContext()

  const onColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = RGBColor.fromHex(e.target.value)
    changePenColor(color)
  }

  return (
    <div>
      <input
        type="color"
        value={drawContext.pen.color.toRGB().css}
        onChange={onColorChange}
      />
      <ColorPicker />
    </div>
  )
}
