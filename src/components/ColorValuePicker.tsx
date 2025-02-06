import React from "react"
import { Color, RGBColor, HSVColor } from "../lib/color"

type Props = {
  color: Color
  onColorPick: (color: Color) => void
}

export function ColorValuePicker(props: Props) {
  const rgbColor = props.color.toRGB()
  const hsvColor = props.color.toHSV()

  const onRGBHexValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = RGBColor.fromHex(e.target.value)
    props.onColorPick(color)
  }

  const onRGBValueChange = (index: 0 | 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rgb = rgbColor.rgb
    rgb[index] = parseInt(e.target.value)
    const color = new RGBColor(rgb)
    props.onColorPick(color)
  }

  const onHSVValueChange = (index: 0 | 1 | 2) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const hsv = hsvColor.hsv
    hsv[index] = parseInt(e.target.value)
    const color = new HSVColor(hsv)
    props.onColorPick(color)
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "repeat(7, auto)",
        gridTemplateColumns: "1fr auto",
        alignContent: "space-between",
        columnGap: "4px",
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
        <React.Fragment key={idSuffix}>
          <label
            htmlFor={"ColorValuePicker-" + idSuffix}
            style={{
              width: "100%",
              height: "fit-content",
              textAlign: "center",
              alignSelf: "center",
              justifySelf: "center",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </label>
          <input
            id={"ColorValuePicker-" + idSuffix}
            type={type}
            value={value}
            onChange={onChange}
            style={{
              boxSizing: "border-box",
              width: type === "number" ? "3rem" : "4rem",
              height: "fit-content",
              textAlign: "right",
              alignSelf: "center",
              justifySelf: "right",
            }}
          />
        </React.Fragment>
      )}
    </div>
  )
}