import menuImg from "../assets/menu.png"
import addImg from "../assets/add.png"
import { useHover } from "../lib/hover"

type Props = {
  icon: "menu" | "add"
  display?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export function IconButton(props: Props) {
  const [hover, hoverHandlers] = useHover()

  let url
  switch (props.icon) {
    case "menu": url = menuImg; break
    case "add":  url = addImg; break
  }

  return (
    <button
      {...hoverHandlers}
      onClick={props.onClick}
      style={{
        display: props.display,
        background: hover ? "whitesmoke" : "white",
        border: "none",
        borderRadius: "21px",
        width: "42px",
        height: "42px",
        cursor: "pointer",
        userSelect: "none",
        verticalAlign: "middle",
      }}
    >
      <img
        src={url}
        draggable={false}
        style={{
          width: "64%",
          display: "block",
          margin: "auto",
        }}
      />
    </button>
  )
}
