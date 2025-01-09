import React from 'react'

type Props = {
  columnCount: number
  children: React.ReactNode
}

export default function Grid(props: Props) {
  return <>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${props.columnCount}, 1fr)`,
      }}
    >{props.children}</div>
  </>
}
