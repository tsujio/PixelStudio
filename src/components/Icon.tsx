import { getIcon, IconType } from "../lib/icon"

type Props = {
  icon: IconType
  size?: "small" | "medium" | "large"
  style?: React.CSSProperties
}

export function Icon(props: Props) {
  const img = getIcon(props.icon)

  const size = props.size ?? "medium"

  const style = Object.fromEntries(Object.entries(props.style ?? {}).filter(e => e[1] !== undefined))

  return (
    <img
      src={img}
      draggable={false}
      style={{
        width: size === "small" ? "16px" : size === "medium" ? "22px" : "32px",
        verticalAlign: "middle",
        ...style
      }}
    />
  )
}
