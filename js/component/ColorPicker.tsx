import React from 'react'
import Color from 'tsx!lib/color'

type Props = {
  color: Color
  onColorPick: (color: Color) => void
}

export default function ColorPicker(props: Props) {
  const onChange = (e: any) => {
    props.onColorPick(new Color(e.target.value))
  }

  return (
    <input type="color" value={props.color.rgb} onChange={onChange} />
  )
}
