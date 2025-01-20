import { HSVColorPicker } from "./HSVColorPicker"
import { ColorValuePicker } from "./ColorValuePicker"
import { Color } from "../lib/color"

type Props = {
  color: Color
  onColorPick: (color: Color) => void
}

export function ColorPicker(props: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      <div>
        <HSVColorPicker color={props.color} onColorPick={props.onColorPick} />
      </div>
      <div style={{marginLeft: "8px"}}>
        <ColorValuePicker color={props.color} onColorPick={props.onColorPick} />
      </div>
    </div>
  )
}
