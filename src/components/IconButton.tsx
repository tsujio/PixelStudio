import { useHover } from "../lib/hover"
import { IconType } from "../lib/icon"
import { Icon } from "./Icon"

type Props = {
  icon: IconType
  size?: "small" | "medium" | "large"
  disabled?: boolean
  style?: React.CSSProperties
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export function IconButton(props: Props) {
  const [hover, hoverHandlers] = useHover()

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (props.onClick && !props.disabled) {
      props.onClick(e)
    }
  }

  const style = Object.fromEntries(Object.entries(props.style ?? {}).filter(e => e[1] !== undefined))

  return (
    <button
      {...hoverHandlers}
      onClick={onClick}
      style={{
        background: props.disabled ? "gray" : hover ? "whitesmoke" : "white",
        border: "none",
        borderRadius: "50%",
        cursor: "pointer",
        userSelect: "none",
        verticalAlign: "middle",
        padding: "12px",
        ...style,
      }}
    >
      <Icon icon={props.icon} size={props.size} />
    </button>
  )
}
