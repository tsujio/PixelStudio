import { useHover } from "../lib/hover"

type Props = {
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}

export function MenuItem(props: Props) {
  const [hover, hoverHandlers] = useHover()

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
      {...hoverHandlers}
    >{props.children}</div>
  )
}
