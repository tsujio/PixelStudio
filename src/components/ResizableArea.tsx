type Props = {
  onResizeStart: () => void,
  onResize: (
    diff: {
      top: number,
      left: number,
      bottom: number,
      right: number,
    },
    fix: boolean,
  ) => void
  children: React.ReactNode
}

export function ResizableArea(props: Props) {
  const onMouseDown = (area: "top,left" | "top" | "top,right" | "left" | "right" | "bottom,left" | "bottom" | "bottom,right") =>
    (e: React.MouseEvent) => {
      const [x, y] = [e.pageX, e.pageY]

      const onResize = (e: MouseEvent, fix: boolean) => {
        const [diffX, diffY] = [e.pageX - x, e.pageY - y]
        props.onResize({
          top: area.includes("top") ? diffY : 0,
          left: area.includes("left") ? diffX : 0,
          bottom: area.includes("bottom") ? diffY : 0,
          right: area.includes("right") ? diffX : 0,
        }, fix)
      }

      const onMouseMove = (e: MouseEvent) => {
        onResize(e, false)
      }

      const onMouseUp = (e: MouseEvent) => {
        document.removeEventListener("mousemove", onMouseMove)
        document.removeEventListener("mouseup", onMouseUp)

        onResize(e, true)
      }

      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)

      props.onResizeStart()
    }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "2px 1fr 2px",
      gridTemplateRows: "2px 1fr 2px",
      width: "fit-content",
      margin: "auto",
    }}>
      <div style={{cursor: "nwse-resize"}} onMouseDown={onMouseDown("top,left")}></div>
      <div style={{cursor: "ns-resize	"}} onMouseDown={onMouseDown("top")}></div>
      <div style={{cursor: "nesw-resize"}} onMouseDown={onMouseDown("top,right")}></div>
      <div style={{cursor: "ew-resize"}} onMouseDown={onMouseDown("left")}></div>
      <div>{props.children}</div>
      <div style={{cursor: "ew-resize"}} onMouseDown={onMouseDown("right")}></div>
      <div style={{cursor: "nesw-resize"}} onMouseDown={onMouseDown("bottom,left")}></div>
      <div style={{cursor: "ns-resize	"}} onMouseDown={onMouseDown("bottom")}></div>
      <div style={{cursor: "nwse-resize"}} onMouseDown={onMouseDown("bottom,right")}></div>
    </div>
  )
}
