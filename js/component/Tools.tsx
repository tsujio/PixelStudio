import React from 'react'
import ColorPicker from 'tsx!component/ColorPicker'
import Color from 'tsx!lib/color'

type Props = {
  color: Color
  onColorPick: (color: Color) => void
}

export default function Tools(props: Props) {
  return <>
    <div>
      <ColorPicker
        color={props.color}
        onColorPick={props.onColorPick}
      />
    </div>
  </>
}
