import { useBoardContext } from "./BoardContext"
import { Icon } from "./Icon"
import { useProjectContext } from "./ProjectContext"
import { useWindowContext } from "./WindowContext"

export const MobileNavigation = () => {
  const { updateProject } = useProjectContext()
  const { boardNavigation, updateBoardNavigation } = useBoardContext()
  const { windowSize } = useWindowContext()

  const onUndoButtonClick = () => {
    updateProject({type: "undo"})
  }

  const onRedoButtonClick = () => {
    updateProject({type: "redo"})
  }

  const onZoomOutButtonClick = () => {
    updateBoardNavigation({type: "setZoom", zoom: boardNavigation.zoom - 0.1, basePoint: [windowSize.width / 2, windowSize.height / 2]})
  }

  const onZoomInButtonClick = () => {
    updateBoardNavigation({type: "setZoom", zoom: boardNavigation.zoom + 0.1, basePoint: [windowSize.width / 2, windowSize.height / 2]})
  }

  if (windowSize.type !== "mobile") {
    return null
  }

  const buttons = [
    [<Icon icon="undo" />, onUndoButtonClick],
    [<Icon icon="redo" />, onRedoButtonClick],
    [<Icon icon="zoomout" />, onZoomOutButtonClick],
    [<Icon icon="zoomin" />, onZoomInButtonClick],
  ] as const

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 9998,
        display: "grid",
        gridTemplateColumns: `repeat(${buttons.length}, 1fr)`,
        placeItems: "center",
        height: "56px",
        width: "100%",
        background: "whitesmoke",
        bottom: 0,
        left: 0,
        borderTop: "2px solid lightgray",
      }}
    >
      {buttons.map(([icon, handler], i) =>
        <div
          key={i}
          style={{
            display: "grid",
            placeItems: "center",
            width: "min(100%, 96px)",
            height: "100%",
            cursor: "pointer",
          }}
          onClick={handler}
        >
          {icon}
        </div>
      )}
    </div>
  )
}
