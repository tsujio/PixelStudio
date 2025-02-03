import { useEffect, useRef, useState } from "react"
import { IconButton } from "./IconButton"
import { Menu } from "./Menu"
import { MenuItem } from "./MenuItem"
import { TextField } from "./TextField"
import { useProjectContext } from "./ProjectContext"
import { Drawing } from "../lib/drawing"
import { drawPixels } from "../lib/canvas"
import { useHover } from "../lib/hover"
import { DrawingPanel } from "../lib/panel"
import { useBoardContext } from "./BoardContext"

type Props = {
  drawing: Drawing
  sidebarWidth: number | undefined
  active: boolean
}

export function ExplorerItem(props: Props) {
  const { project, updateProject } = useProjectContext()
  const { boardNavigation, updateBoardNavigation } = useBoardContext()

  const [ hover, hoverHandlers ] = useHover()

  const onDrawingNameClick = () => {
    const panel = project.panels.find(p => p instanceof DrawingPanel && p.drawingId === props.drawing.id)
    const [xOffset, yOffset] = [-((props.sidebarWidth ?? 0) + 20) / boardNavigation.zoom, -60 / boardNavigation.zoom]
    if (panel) {
      updateBoardNavigation({type: "setPerspective", perspective: [panel.x + xOffset, panel.y + yOffset], duration: 300})
      updateProject({type: "setPanelZ", panelId: panel.id, offset: Infinity})
    } else {
      updateProject({type: "openPanel", drawingId: props.drawing.id, x: boardNavigation.perspective[0] - xOffset, y: boardNavigation.perspective[1] - yOffset})
    }
  }

  const [menuButtonElement, setMenuButtonElement] = useState<HTMLElement | null>(null)

  const onMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMenuButtonElement(e.currentTarget)
  }

  const onMenuClose = () => {
    setMenuButtonElement(null)
  }

  const onCloseButtonClick = () => {
    const panel = project.panels.find(p => p instanceof DrawingPanel && p.drawingId === props.drawing.id)
    if (panel) {
      updateProject({type: "closePanel", panelId: panel.id})
    }
    setMenuButtonElement(null)
  }

  const onExportButtonClick = async () => {
    const height = props.drawing.pixelSize * props.drawing.rowCount
    const width = props.drawing.pixelSize * props.drawing.columnCount
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext("2d")
    if (ctx === null) {
      throw new Error("Failed to get context from offscreen canvas")
    }
    drawPixels(ctx, canvas, props.drawing.data, props.drawing.pixelSize)

    const blob = await canvas.convertToBlob({type: "image/png"})
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = props.drawing.name + ".png"
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)

    setMenuButtonElement(null)
  }

  const [newName, setNewName] = useState<string | null>(null)

  const onRenameButtonClick = () => {
    setNewName(props.drawing.name)
    setMenuButtonElement(null)
  }

  const onNewNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value)
  }

  const onNewNameInputBlur = () => {
    if (newName !== null && newName !== "" && newName !== props.drawing.name) {
      updateProject({type: "renameDrawing", drawingId: props.drawing.id, newName: newName})
    }
    setNewName(null)
  }

  const onCopyButtonClick = () => {
    updateProject({type: "copyDrawing", drawingId: props.drawing.id})
    setMenuButtonElement(null)
  }

  const onDeleteButtonClick = () => {
    if (window.confirm(`Are you sure you want to delete '${props.drawing.name}'?`)) {
      updateProject({type: "deleteDrawing", drawingId: props.drawing.id})
    }
    setMenuButtonElement(null)
  }

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && props.active) {
      ref.current.scrollIntoView()
      onDrawingNameClick()
    }
  }, [props.active])

  const activePanel = project.getActivePanel()
  const isPanelActive = activePanel instanceof DrawingPanel && activePanel.drawingId === props.drawing.id

  return (
    <div
      ref={ref}
      onClick={onDrawingNameClick}
      style={{
        padding: "12px",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        background: hover || menuButtonElement || isPanelActive ? "whitesmoke" : "white",
        cursor: "pointer",
      }}
      {...hoverHandlers}
    >
      <div
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        {newName === null ?
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >{props.drawing.name}</span> :
        <TextField
            value={newName}
            onChange={onNewNameInputChange}
            onBlur={onNewNameInputBlur}
            focusOnMount={true}
            blurOnEnter={true}
        />}
      </div>
      <div>
        <IconButton
          icon="menu"
          style={{
            display: menuButtonElement || isPanelActive ? "inline-block" : "none"
          }}
          onClick={onMenuClick}
        />
        <Menu
          open={menuButtonElement !== null}
          anchor={menuButtonElement}
          onClose={onMenuClose}
        >
          <MenuItem onClick={onExportButtonClick} icon="download">Export</MenuItem>
          <MenuItem onClick={onCloseButtonClick} icon="close">Close</MenuItem>
          <MenuItem onClick={onRenameButtonClick} icon="rename">Rename</MenuItem>
          <MenuItem onClick={onCopyButtonClick} icon="rename">Copy</MenuItem>
          <MenuItem onClick={onDeleteButtonClick} icon="delete">Delete</MenuItem>
        </Menu>
      </div>
    </div>
  )
}
