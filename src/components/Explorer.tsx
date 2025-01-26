import { useEffect, useRef, useState } from "react"
import { useProjectContext } from "./ProjectContext"
import { useWindowSystemContext } from "./WindowSystem"
import { ExplorerItem } from "./ExplorerItem"
import { IconButton } from "./IconButton"
import { Menu } from "./Menu"
import { MenuItem } from "./MenuItem"
import { TextField } from "./TextField"
import { Drawing } from "../lib/drawing"
import { createFile, openFile, supportFileSystemAPI, writeToFile } from "../lib/filesystem"
import { makeDragStartCallback } from "../lib/drag"

export function Explorer() {
  const { project, updateProject } = useProjectContext()
  const { windows, closeWindow } = useWindowSystemContext()

  let drawings: Drawing[] | null = null
  if (project) {
    drawings = Object.values(project.drawings)
    drawings.sort((a, b) => a.name.localeCompare(b.name))
  }

  const [projectMenuButtonElement, setProjectMenuButtonElement] = useState<HTMLElement | null>(null)

  const onProjectMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setProjectMenuButtonElement(e.nativeEvent.target as HTMLElement)
  }

  const onProjectMenuClose = () => {
    setProjectMenuButtonElement(null)
  }

  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null)

  const onNewProjectButtonClick = () => {
    updateProject({type: "newProject"})
    setFileHandle(null)

    // Close all drawing windows
    Object.values(windows).forEach(window => {
      if (window.metadata.type === "drawing") {
        closeWindow(window.windowId)
      }
    })

    setProjectMenuButtonElement(null)
  }

  const onOpenProjectButtonClick = async () => {
    const {fileHandle, contents} = await openFile()
    const json = JSON.parse(contents)
    updateProject({type: "load", json})
    setFileHandle(fileHandle)

    // Close all drawing windows
    Object.values(windows).forEach(window => {
      if (window.metadata.type === "drawing") {
        closeWindow(window.windowId)
      }
    })
  }

  const [newProjectName, setNewProjectName] = useState<string | null>(null)

  const onRenameProjectButtonClick = () => {
    setNewProjectName(project.name)
    setProjectMenuButtonElement(null)
  }

  const onNewProjectNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewProjectName(e.target.value)
  }

  const onNewProjectNameInputBlur = () => {
    if (newProjectName !== null && newProjectName !== "" && newProjectName !== project.name) {
      updateProject({type: "rename", newName: newProjectName})
    }
    setNewProjectName(null)
  }

  const onSaveProjectButtonClick = async () => {
    if (fileHandle) {
      writeToFile(fileHandle, JSON.stringify(project))
    }
  }

  const onSaveAsProjectButtonClick = async () => {
    const json = JSON.stringify(project)
    const fileHandle = await createFile(json, project.nameToDownload)
    setFileHandle(fileHandle)
  }

  const onDownloadProjectButtonClick = () => {
    const json = JSON.stringify(project)
    const blob = new Blob([json], {type: "application/json"})
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = project.nameToDownload
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const onAddDrawingButtonClick = () => {
    updateProject({type: "addDrawing"})
  }

  const explorerItemContainerRef = useRef<HTMLDivElement>(null)
  const onPointerDown = makeDragStartCallback((e: React.PointerEvent<HTMLDivElement>) => {
    let prevY = e.pageY

    const onDragging = (e: PointerEvent) => {
      const diff = e.pageY - prevY
      if (explorerItemContainerRef.current) {
        explorerItemContainerRef.current.scrollBy(0, -diff)
      }
      prevY = e.pageY
    }

    return {onDragging}
  }, true)

  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "KeyS") {
        e.preventDefault()

        if (fileHandle) {
          await onSaveProjectButtonClick()
        } else {
          await onSaveAsProjectButtonClick()
        }
      }

      if (e.ctrlKey && e.code === "KeyO") {
        e.preventDefault()
        await onOpenProjectButtonClick()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [fileHandle, onSaveProjectButtonClick, onSaveAsProjectButtonClick, onOpenProjectButtonClick])

  return (
    <div style={{display: "grid", gridTemplateRows: "auto minmax(0, 1fr)"}}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          padding: "16px 12px",
        }}
      >
        <div
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
          }}
        >
          {newProjectName === null ?
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >{project.name}</span> :
          <TextField
            value={newProjectName}
            onChange={onNewProjectNameInputChange}
            onBlur={onNewProjectNameInputBlur}
            focusOnMount={true}
            blurOnEnter={true}
          />}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <IconButton
            icon="menu"
            onClick={onProjectMenuClick}
          />
          <Menu
            open={projectMenuButtonElement !== null}
            anchor={projectMenuButtonElement}
            onClose={onProjectMenuClose}
          >
            <MenuItem onClick={onNewProjectButtonClick} icon="new">New</MenuItem>
            <MenuItem onClick={onOpenProjectButtonClick} icon="open">Open</MenuItem>
            <MenuItem onClick={onRenameProjectButtonClick} icon="rename">Rename</MenuItem>
            <MenuItem disabled={!supportFileSystemAPI || !fileHandle} onClick={onSaveProjectButtonClick} icon="save">Save</MenuItem>
            <MenuItem disabled={!supportFileSystemAPI} onClick={onSaveAsProjectButtonClick} icon="saveas">Save As</MenuItem>
            <MenuItem onClick={onDownloadProjectButtonClick} icon="download">Download</MenuItem>
          </Menu>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr)",
          borderTop: "1px solid gray",
        }}
      >
        <div style={{padding: "12px"}}>
          <IconButton
            icon="add"
            onClick={onAddDrawingButtonClick}
          />
        </div>
        <div
          ref={explorerItemContainerRef}
          style={{
            overflowY: "scroll",
          }}
          onPointerDown={onPointerDown}
        >
          {drawings && drawings.map(drawing =>
            <ExplorerItem key={drawing.id} drawing={drawing} />
          )}
        </div>
      </div>
    </div>
  )
}