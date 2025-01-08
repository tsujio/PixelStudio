import React from 'react'

type Props = {
  value: string
  onColorPick: (value: string) => void
}

export default function ColorPicker(props: Props) {
  const onChange = (e: any) => {
    props.onColorPick(e.target.value)
  }

  return (
    <input type="color" value={props.value} onChange={onChange} />
  )
}
