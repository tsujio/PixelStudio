import { getIcon, IconType } from "../lib/icon"

type Props = {
  icon: IconType
  size?: "small" | "medium" | "large"
}

export function Icon(props: Props) {
  const img = getIcon(props.icon)

  const size = props.size ?? "medium"

  return (
    <img
      src={img}
      draggable={false}
      style={{
        width: size === "small" ? "16px" : size === "medium" ? "22px" : "32px",
        verticalAlign: "middle",
      }}
    />
  )
}
