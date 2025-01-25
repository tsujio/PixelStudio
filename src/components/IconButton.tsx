import { useHover } from "../lib/hover"
import { IconType } from "../lib/icon"
import { Icon } from "./Icon"

type Props = {
  icon: IconType
  display?: string
  size?: "small" | "medium" | "large"
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export function IconButton(props: Props) {
  const [hover, hoverHandlers] = useHover()

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (props.onClick) {
      props.onClick(e)
    }
  }

  return (
    <button
      {...hoverHandlers}
      onClick={onClick}
      style={{
        display: props.display,
        background: hover ? "whitesmoke" : "white",
        border: "none",
        borderRadius: "50%",
        cursor: "pointer",
        userSelect: "none",
        verticalAlign: "middle",
        padding: "12px",
      }}
    >
      <Icon icon={props.icon} size={props.size} />
    </button>
  )
}
