import { useBoardContext } from "./Board"
import { IconButton } from "./IconButton"
import { useProjectContext } from "./ProjectContext"

export const MobileNavigation = () => {
  const { updateProject } = useProjectContext()
  const { boardNavigation, updateBoardNavigation } = useBoardContext()

  const onUndoButtonClick = () => {
    updateProject({type: "undo"})
  }

  const onRedoButtonClick = () => {
    updateProject({type: "redo"})
  }

  const onZoomOutButtonClick = () => {
    updateBoardNavigation({type: "setZoom", zoom: boardNavigation.zoom - 0.1, basePoint: [window.innerWidth / 2, window.innerHeight / 2]})
  }

  const onZoomInButtonClick = () => {
    updateBoardNavigation({type: "setZoom", zoom: boardNavigation.zoom + 0.1, basePoint: [window.innerWidth / 2, window.innerHeight / 2]})
  }

  if (window.innerWidth > 700) {
    return null
  }

  const buttons = [
    <IconButton icon="undo" onClick={onUndoButtonClick} />,
    <IconButton icon="redo" onClick={onRedoButtonClick} />,
    <IconButton icon="zoomout" onClick={onZoomOutButtonClick} />,
    <IconButton icon="zoomin" onClick={onZoomInButtonClick} />,
  ]

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 9998,
        display: "grid",
        gridTemplateColumns: `repeat(${buttons.length}, 1fr)`,
        height: "fit-content",
        width: "100%",
        background: "whitesmoke",
        bottom: 0,
        left: 0,
        borderTop: "2px solid lightgray",
      }}
    >
      {buttons.map((b, i) =>
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "12px",
          }}
        >
          {b}
        </div>
      )}
    </div>
  )
}
