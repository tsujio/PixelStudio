import { useEffect, useRef } from 'react'

type Props = {
  open: boolean
  anchor: HTMLElement | null
  onClose: () => void
  children: React.ReactNode
}

export function Menu(props: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

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
      tabIndex={-1}
      style={{
        display: props.open ? "block" : "none",
        position: "absolute",
        top: props.anchor.offsetTop + props.anchor.offsetHeight,
        left: props.anchor.offsetLeft,
        background: "white",
        boxShadow: "1px 2px 6px 0px gray",
        padding: "8px 0",
      }}
      onBlur={props.onClose}
    >
      {props.children}
    </div>
  )
}
