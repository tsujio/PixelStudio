import React, { useState, useRef, useEffect } from 'react'
import { useProjectContext } from 'tsx!component/ProjectContext'
import Menu, { MenuItem } from 'tsx!component/Menu'
import Drawing from 'tsx!lib/drawing'

type Props = {
  drawing: Drawing
}

export default function ExplorerDrawingItem(props: Props) {
  const { project, updateProject } = useProjectContext()

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
      props.drawing.name :
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
        <MenuItem onClick={onRenameMenuClick}>Rename</MenuItem>
        <MenuItem onClick={onDeleteMenuClick}>Delete</MenuItem>
      </Menu>
    </div>
  </>
}
