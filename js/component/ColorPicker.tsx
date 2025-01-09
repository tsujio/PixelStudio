import React from 'react'
import Color from 'tsx!lib/color'
import { useDrawContext } from 'tsx!component/DrawContext'

type Props = {}

export default function ColorPicker(props: Props) {
  const { drawContext, updateDrawContext } = useDrawContext()

  const onChange = (e: any) => {
    updateDrawContext({type: "changeColor", color: new Color(e.target.value)})
  }

  return (
    <input type="color" value={drawContext.color.rgb} onChange={onChange} />
  )
}
