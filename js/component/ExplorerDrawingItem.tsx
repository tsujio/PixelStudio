import React, { useState, useRef, useEffect } from 'react'
import { useProjectContext } from 'tsx!component/ProjectContext'
import Menu, { MenuItem } from 'tsx!component/Menu'
import Drawing from 'tsx!lib/drawing'
import { useWindowContext } from 'tsx!component/Window'

type Props = {
  drawing: Drawing
  onClick: () => void
}

export default function ExplorerDrawingItem(props: Props) {
  const { project, updateProject } = useProjectContext()

  const { activateWindow } = useWindowContext()

  const menuButtonRef = useRef(null)
  const newNameInputRef = useRef(null)

  const [menuOpen, setMenuOpen] = useState<boolean>(false)

  const [newName, setNewName] = useState<string | null>(null)

  const onMenuClick = () => {
    setMenuOpen(true)
  }

  const onMenuClose = () => {
    setMenuOpen(false)
  }

  const onExportMenuClick = async () => {
    const pixelSize = 10
    const data = props.drawing.data
    const height = pixelSize * data.length
    const width = pixelSize * data[0].length
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext("2d")
    if (ctx) {
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
          if (data[i][j]) {
            ctx.fillStyle = data[i][j].rgb
            ctx.fillRect(pixelSize * j, pixelSize * i, pixelSize, pixelSize)
          }
        }
      }
    }

    const blob = await canvas.convertToBlob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = props.drawing.name + ".png"
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    a.remove()
  }

  useEffect(() => {
    if (newName !== null && newNameInputRef.current) {
      newNameInputRef.current.focus()
    }
  }, [newName])

  const onRenameMenuClick = () => {
    setNewName(props.drawing.name)
    setMenuOpen(false)
  }

  const onNewNameInputChange = (e: any) => {
    setNewName(e.target.value)
  }

  const onNewNameInputBlur = () => {
    updateProject({type: "renameDrawing", drawingId: props.drawing.id, name: newName})
    setNewName(null)
  }

  const onDeleteMenuClick = () => {
    updateProject({type: "deleteDrawing", drawingId: props.drawing.id})
    setMenuOpen(false)
  }

  return <>
    <div
      style={{
        padding: "12px 16px",
      }}
    >
      {newName === null ?
      <span>{props.drawing.name}</span> :
      <input ref={newNameInputRef} type="text" value={newName} onChange={onNewNameInputChange} onBlur={onNewNameInputBlur} />}
      <button
        ref={menuButtonRef}
        onClick={onMenuClick}
      >:</button>
      <Menu
        open={menuOpen}
        anchor={menuButtonRef.current}
        onClose={onMenuClose}
      >
        <MenuItem onClick={onExportMenuClick}>Export</MenuItem>
        <MenuItem onClick={onRenameMenuClick}>Rename</MenuItem>
        <MenuItem onClick={onDeleteMenuClick}>Delete</MenuItem>
      </Menu>
    </div>
  </>
}
