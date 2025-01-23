import { useHover } from "../lib/hover"
import { IconType } from "../lib/icon"
import { Icon } from "./Icon"

type Props = {
  icon?: IconType
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}

export function MenuItem(props: Props) {
  const [hover, hoverHandlers] = useHover()

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (props.disabled !== true && props.onClick) {
      props.onClick()
    }
  }

  const icon = props.icon ?
    <span style={{marginRight: "12px"}}>
      <Icon icon={props.icon} />
    </span> :
    null

  return (
    <div
      style={{
        padding: "12px 18px",
        color: props.disabled ? "gray" : undefined,
        background: props.disabled ? "lightgray" : hover ? "whitesmoke" : "white",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
      onClick={onClick}
      {...hoverHandlers}
    >{icon} {props.children}</div>
  )
}
