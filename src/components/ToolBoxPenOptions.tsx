import { useDrawContext } from "./DrawContext"
import { Color } from "../lib/color"

export function ToolBoxPenOptions() {
  const { drawContext, changePenColor } = useDrawContext()

  const onColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    changePenColor(new Color(e.target.value))
  }

  return (
    <div>
      <input
        type="color"
        value={drawContext.pen.color.rgb}
        onChange={onColorChange}
      />
    </div>
  )
}
