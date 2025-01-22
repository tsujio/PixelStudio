import { useState } from "react"
import { useProjectContext } from "./ProjectContext"
import { useWindowSystemContext } from "./WindowSystem"
import { ExplorerItem } from "./ExplorerItem"
import { IconButton } from "./IconButton"
import { Menu } from "./Menu"
import { MenuItem } from "./MenuItem"
import { TextField } from "./TextField"
import { Drawing } from "../lib/drawing"

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

  const filePickerOpts: OpenFilePickerOptions & SaveFilePickerOptions = {
    id: "project",
    startIn: "documents",
    types: [
      {
        description: "Pixel Studio Project Files",
        accept: {
          "application/json": [".json"]
        }
      }
    ],
  }

  const onOpenProjectButtonClick = async () => {
    const [fileHandle] = await window.showOpenFilePicker({
      ...filePickerOpts,
      excludeAcceptAllOption: true,
      multiple: false,
    })
    const file = await fileHandle.getFile()
    const contents = await file.text()

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
    if (newProjectName !== null && newProjectName !== "") {
      updateProject({type: "rename", newName: newProjectName})
    }
    setNewProjectName(null)
  }

  const saveFile = async (fileHandle: FileSystemFileHandle) => {
    const writable = await fileHandle.createWritable()
    try {
      const json = JSON.stringify(project)
      writable.write(json)
    } finally {
      await writable.close()
    }
  }

  const onSaveProjectButtonClick = async () => {
    if (fileHandle) {
      saveFile(fileHandle)
    }
  }

  const onSaveAsProjectButtonClick = async () => {
    const newFileHandle: FileSystemFileHandle = await window.showSaveFilePicker({
      ...filePickerOpts,
      suggestedName: project.nameToDownload,
    })

    await saveFile(newFileHandle)

    setFileHandle(newFileHandle)
  }

  const onDownloadProjectButtonClick = () => {
    const json = JSON.stringify(project, null, 2)
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

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 24px",
          padding: "16px 12px",
        }}
      >
        <div
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {newProjectName === null ?
          project.name :
          <TextField
            value={newProjectName}
            onChange={onNewProjectNameInputChange}
            onBlur={onNewProjectNameInputBlur}
            focusOnMount={true}
            blurOnEnter={true}
          />}
        </div>
        <div>
          <IconButton
            icon="menu"
            onClick={onProjectMenuClick}
          />
          <Menu
            open={projectMenuButtonElement !== null}
            anchor={projectMenuButtonElement}
            onClose={onProjectMenuClose}
          >
            <MenuItem onClick={onNewProjectButtonClick}>New</MenuItem>
            <MenuItem onClick={onOpenProjectButtonClick}>Open</MenuItem>
            <MenuItem onClick={onRenameProjectButtonClick}>Rename</MenuItem>
            <MenuItem onClick={onSaveProjectButtonClick}>Save</MenuItem>
            <MenuItem onClick={onSaveAsProjectButtonClick}>Save As</MenuItem>
            <MenuItem onClick={onDownloadProjectButtonClick}>Download</MenuItem>
          </Menu>
        </div>
      </div>
      <div style={{borderTop: "1px solid gray"}}>
        <div style={{padding: "12px"}}>
          <IconButton
            icon="add"
            onClick={onAddDrawingButtonClick}
          />
        </div>
        <div>
          {drawings && drawings.map(drawing =>
            <ExplorerItem key={drawing.id} drawing={drawing} />
          )}
        </div>
      </div>
    </div>
  )
}