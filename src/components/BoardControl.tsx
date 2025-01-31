import { useBoardContext } from "./BoardContext"
import { IconButton } from "./IconButton"
import { width as toolBoxWidth } from "./ToolBox"
import { useWindowContext } from "./WindowContext"

type Props = {
  toolBoxOpen: boolean
  setToolBoxOpen: (toolBoxOpen: boolean) => void
}

export const BoardControl = (props: Props) => {
  const { boardNavigation, updateBoardNavigation } = useBoardContext()
  const { windowSize } = useWindowContext()

  const zoomBasePoint: [number, number] = [windowSize.width / 2, windowSize.height / 2]

  const onZoomInButtonClick = () => {
    updateBoardNavigation({type: "setZoom", zoom: boardNavigation.zoom + 0.1, basePoint: zoomBasePoint})
  }

  const onZoomOutButtonClick = () => {
    updateBoardNavigation({type: "setZoom", zoom: boardNavigation.zoom - 0.1, basePoint: zoomBasePoint})
  }

  const onOpenToolBoxButtonClick = () => {
    props.setToolBoxOpen(true)
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: props.toolBoxOpen && windowSize.type !== "mobile" ? `${toolBoxWidth}px` : 0,
        display: "grid",
        gridTemplateColumns: `repeat(${props.toolBoxOpen ? 2 : 3}, 1fr)`,
        gap: "4px",
        zIndex: 9998,
      }}
    >
      <IconButton
        icon="zoomout"
        size="small"
        onClick={onZoomOutButtonClick}
      />
      <IconButton
        icon="zoomin"
        size="small"
        onClick={onZoomInButtonClick}
      />
      {!props.toolBoxOpen &&
      <IconButton
        icon="pen"
        size="small"
        onClick={onOpenToolBoxButtonClick}
      />}
    </div>
  )
}
