import React from 'react'

type Props = {
  children: React.ReactNode
}

export default function Window(props: Props) {
  return (
    <div
      style={{
        display: "inline-block",
        padding: "16px",
        border: "1px solid gray",
      }}
    >{props.children}</div>
  )
}
