import { RGBColor, HSVColor } from "../lib/color"
import { useDrawContext } from "./DrawContext"

export function ColorValuePicker() {
  const { drawContext, changePenColor } = useDrawContext()

  const rgbColor = drawContext.pen.color.toRGB()
  const hsvColor = drawContext.pen.color.toHSV()

  const onRGBHexValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = RGBColor.fromHex(e.target.value)
    changePenColor(color)
  }

  const onRGBValueChange = (index: 0 | 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rgb = rgbColor.rgb
    rgb[index] = parseInt(e.target.value)
    const color = new RGBColor(rgb)
    changePenColor(color)
  }

  const onHSVValueChange = (index: 0 | 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const hsv = hsvColor.hsv
    hsv[index] = parseInt(e.target.value)
    const color = new HSVColor(hsv)
    changePenColor(color)
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "repeat(7, 1fr)",
        rowGap: "8px",
        height: "100%",
      }}
    >
      {[
        {idSuffix: "rgb-hex", label: "Hex", type: "text", value: rgbColor.css, onChange: onRGBHexValueChange},
        {idSuffix: "rgb-r", label: "R", type: "number", value: rgbColor.rgb[0], onChange: onRGBValueChange(0)},
        {idSuffix: "rgb-g", label: "G", type: "number", value: rgbColor.rgb[1], onChange: onRGBValueChange(1)},
        {idSuffix: "rgb-b", label: "B", type: "number", value: rgbColor.rgb[2], onChange: onRGBValueChange(2)},
        {idSuffix: "hsv-h", label: "H", type: "number", value: hsvColor.hsv[0], onChange: onHSVValueChange(0)},
        {idSuffix: "hsv-s", label: "S", type: "number", value: hsvColor.hsv[1], onChange: onHSVValueChange(1)},
        {idSuffix: "hsv-v", label: "V", type: "number", value: hsvColor.hsv[2], onChange: onHSVValueChange(2)},
      ].map(({idSuffix, label, type, value, onChange}) =>
        <label
          key={idSuffix}
          htmlFor={"ColorValuePicker-" + idSuffix}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(20px, auto) 1fr",
            columnGap: "8px",
            whiteSpace: "nowrap",
          }}
        >
          <span>{label}</span>
          <input
            id={"ColorValuePicker-" + idSuffix}
            type={type}
            value={value}
            onChange={onChange}
            style={{
              boxSizing: "border-box",
              width: "100%",
              textAlign: "right",
            }}
          />
        </label>
      )}
    </div>
  )
}