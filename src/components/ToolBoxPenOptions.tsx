import { useDrawContext } from "./DrawContext"
import { ColorPicker } from "./ColorPicker"
import { RGBColor } from "../lib/color"

export function ToolBoxPenOptions() {
  const { drawContext, changePenColor } = useDrawContext()

  const onColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = new RGBColor([1, 3, 5].map(i => parseInt(e.target.value.substring(i, i + 2), 16)) as [number, number, number])
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
