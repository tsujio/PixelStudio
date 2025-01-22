import { useState } from "react"

type Props = {
  disabled?: boolean
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

  const onClick = () => {
    if (props.disabled !== true && props.onClick) {
      props.onClick()
    }
  }

  return (
    <div
      style={{
        padding: "12px 16px",
        color: props.disabled ? "gray" : undefined,
        background: props.disabled ? "lightgray" : hover ? "whitesmoke" : "white",
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >{props.children}</div>
  )
}
