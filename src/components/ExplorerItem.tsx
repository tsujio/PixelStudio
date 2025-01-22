import { useState } from "react"
import { IconButton } from "./IconButton"
import { Menu } from "./Menu"
import { MenuItem } from "./MenuItem"
import { TextField } from "./TextField"
import { useProjectContext } from "./ProjectContext"
import { useWindowSystemContext } from "./WindowSystem"
import { Drawing } from "../lib/drawing"
import { drawPixels } from "../lib/canvas"
import { useHover } from "../lib/hover"

type Props = {
  drawing: Drawing
}

export function ExplorerItem(props: Props) {
  const { windows, openWindow, closeWindow } = useWindowSystemContext()

  const { updateProject } = useProjectContext()

  const [ hover, hoverHandlers ] = useHover()

  const onDrawingNameClick = () => {
    openWindow(100, 300, {type: "drawing", drawingId: props.drawing.id})
  }

  const [menuButtonElement, setMenuButtonElement] = useState<HTMLElement | null>(null)

  const onMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMenuButtonElement(e.nativeEvent.target as HTMLElement)
  }

  const onMenuClose = () => {
    setMenuButtonElement(null)
  }

  const onCloseButtonClick = () => {
    for (const windowId in windows) {
      const metadata = windows[windowId].metadata
      if (metadata.type === "drawing" && metadata.drawingId === props.drawing.id) {
        closeWindow(windowId)
        return
      }
    }
  }

  const onExportButtonClick = async () => {
    const height = props.drawing.pixelSize * props.drawing.rowCount
    const width = props.drawing.pixelSize * props.drawing.columnCount
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext("2d")
    if (ctx === null) {
      throw new Error("")
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

  const onDeleteButtonClick = () => {
    updateProject({type: "deleteDrawing", drawingId: props.drawing.id})
  }

  return (
    <div
      style={{
        padding: "12px 8px",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        background: hover ? "whitesmoke" : "white",
      }}
      {...hoverHandlers}
    >
      <div
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "flex",
          alignItems: "center",
        }}
      >
        {newName === null ?
        <span onClick={onDrawingNameClick}>{props.drawing.name}</span> :
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
          display={hover || menuButtonElement ? "inline-block" : "none"}
          onClick={onMenuClick}
        />
        <Menu
          open={menuButtonElement !== null}
          anchor={menuButtonElement}
          onClose={onMenuClose}
        >
          <MenuItem onClick={onExportButtonClick}>Export</MenuItem>
          <MenuItem onClick={onCloseButtonClick}>Close</MenuItem>
          <MenuItem onClick={onRenameButtonClick}>Rename</MenuItem>
          <MenuItem onClick={onDeleteButtonClick}>Delete</MenuItem>
        </Menu>
      </div>
    </div>
  )
}
