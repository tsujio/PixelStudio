import { HSVColorPicker } from "./HSVColorPicker"
import { ColorValuePicker } from "./ColorValuePicker"

export function ColorPicker() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      <div>
        <HSVColorPicker />
      </div>
      <div style={{marginLeft: "8px"}}>
        <ColorValuePicker />
      </div>
    </div>
  )
}
