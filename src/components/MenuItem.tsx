import { useState } from "react"

type Props = {
  onClick?: () => void
  children: React.ReactNode
}

export function MenuItem(props: Props) {
  const [hover, setHover] = useState(false)

  const onMouseEnter = () => {
    setHover(true)
  }

  const onMouseLeave = () => {
    setHover(false)
  }

  return (
    <div
      style={{
        padding: "12px 16px",
        background: hover ? "whitesmoke" : "white",
      }}
      onClick={props.onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >{props.children}</div>
  )
}
