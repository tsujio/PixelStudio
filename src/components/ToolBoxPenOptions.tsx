import { useDrawContext } from "./DrawContext"
import { ColorPicker } from "./ColorPicker"
import { RGBColor } from "../lib/color"

export function ToolBoxPenOptions() {
  const { drawContext, changePenColor, changePenSetPalette } = useDrawContext()

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
      <div style={{marginTop: "8px"}}>
        <ColorPicker
          color={drawContext.pen.color}
          onColorPick={changePenColor}
        />
      </div>
      <div>
        <input
          type="checkbox"
          checked={drawContext.pen.setPalette}
          onChange={e => changePenSetPalette(e.target.checked)}
        />
      </div>
    </div>
  )
}
