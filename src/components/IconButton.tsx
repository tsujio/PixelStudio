type Props = {
  icon: "menu" | "add"
  display?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export function IconButton(props: Props) {
  let text
  switch (props.icon) {
    case "menu":
      text = ":"
      break
    case "add":
      text = "+"
      break
  }

  return (
    <button
      onClick={props.onClick}
      style={{
        display: props.display,
      }}
    >{text}</button>
  )
}
