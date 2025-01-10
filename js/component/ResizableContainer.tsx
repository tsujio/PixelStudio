import React, { useEffect, useRef } from 'react'

type Props = {
  onResize: () => void
  children: React.ReactNode
}

export default function ResizableContainer(props: Props) {
  return <>
    <div style={{display: "flex", height: "4px", alignItems: "stretch"}}>
      <div style={{width: "4px", cursor: "nwse-resize"}} />
      <div style={{flexGrow: 1, cursor: "ns-resize"}} />
      <div style={{width: "4px", cursor: "nesw-resize"}} />
    </div>
    <div style={{display: "flex", alignItems: "stretch"}}>
      <div style={{width: "4px", cursor: "ew-resize"}} />
      <div style={{flexGrow: 1}}>{props.children}</div>
      <div style={{width: "4px", cursor: "ew-resize"}} />
    </div>
    <div style={{display: "flex", height: "4px", alignItems: "stretch"}}>
      <div style={{width: "4px", cursor: "nesw-resize"}} />
      <div style={{flexGrow: 1, cursor: "ns-resize"}} />
      <div style={{width: "4px", cursor: "nwse-resize"}} />
    </div>
  </>
}
