import React, { useEffect, useRef } from 'react'

type Props = {
  open: boolean
  anchor: HTMLElement | null
  onClose: () => void
  children: React.ReactNode
}

export default function Menu(props: Props) {
  const ref = useRef(null)

  useEffect(() => {
    if (props.open && ref.current) {
      ref.current.focus()
    }
  }, [props.open])

  if (!props.anchor) {
    return null
  }

  return (
    <div
      ref={ref}
      tabIndex="-1"
      style={{
        display: props.open ? "block" : "none",
        position: "absolute",
        top: props.anchor.offsetTop + props.anchor.offsetHeight,
        left: props.anchor.offsetLeft,
        background: "white",
      }}
      onBlur={props.onClose}
    >
      {props.children}
    </div>
  )
}

type MenuItemProps = {
  onClick: () => void
  children: React.ReactNode
}

export function MenuItem(props: MenuItemProps) {
  return (
    <div
      style={{
        padding: "12px 16px",
      }}
      onClick={props.onClick}
    >{props.children}</div>
  )
}