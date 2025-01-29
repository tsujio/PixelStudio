import { useGesture } from "./GestureContext"

type Props = {
  onResizeStart?: () => void,
  onResize: (
    diff: {
      top: number,
      left: number,
      bottom: number,
      right: number,
    },
    fix: boolean,
  ) => void
  draggableAreaSpan: number,
  children: React.ReactNode
}

export function ResizableArea(props: Props) {
  const gestureHandlersArray = ["top,left", "top", "top,right", "left", "right", "bottom,left", "bottom", "bottom,right"].map(area =>
    useGesture({
      onDragStart: e => {
        if (props.onResizeStart) {
          props.onResizeStart()
        }

        const [x, y] = [e.pageX, e.pageY]
        return (e: React.PointerEvent, fix: boolean) => {
          const [diffX, diffY] = [e.pageX - x, e.pageY - y]
          props.onResize({
            top: area.includes("top") ? diffY : 0,
            left: area.includes("left") ? diffX : 0,
            bottom: area.includes("bottom") ? diffY : 0,
            right: area.includes("right") ? diffX : 0,
          }, fix)
        }
      },
      onDragMove: (e, dragStartData) => {
        dragStartData(e, false)
      },
      onDragEnd: (e, dragStartData) => {
        dragStartData(e, true)
      },
    })
  )

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `${props.draggableAreaSpan}px 1fr ${props.draggableAreaSpan}px`,
      gridTemplateRows: `${props.draggableAreaSpan}px 1fr ${props.draggableAreaSpan}px`,
      width: "fit-content",
      margin: "auto",
    }}>
      <div style={{cursor: "nwse-resize"}} {...gestureHandlersArray[0]}></div>
      <div style={{cursor: "ns-resize	"}} {...gestureHandlersArray[1]}></div>
      <div style={{cursor: "nesw-resize"}} {...gestureHandlersArray[2]}></div>
      <div style={{cursor: "ew-resize"}} {...gestureHandlersArray[3]}></div>
      <div>{props.children}</div>
      <div style={{cursor: "ew-resize"}} {...gestureHandlersArray[4]}></div>
      <div style={{cursor: "nesw-resize"}} {...gestureHandlersArray[5]}></div>
      <div style={{cursor: "ns-resize	"}} {...gestureHandlersArray[6]}></div>
      <div style={{cursor: "nwse-resize"}} {...gestureHandlersArray[7]}></div>
    </div>
  )
}
