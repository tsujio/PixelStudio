import React from 'react'

type Props = {
  children: React.ReactNode
  onClick?: () => void
}

export default function Button(props: Props) {
  return (
    <button
      onClick={props.onClick}
    >{props.children}</button>
  )
}
