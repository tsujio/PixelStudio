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

  const onNewProjectButtonClick = () => {
    updateProject({type: "newProject"})

    Object.values(windows).forEach(window => {
      if (window.metadata.type === "drawing") {
        closeWindow(window.windowId)
      }
    })

    setProjectMenuButtonElement(null)
  }

  const onOpenProjectButtonClick = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.addEventListener("change", e => {
      const target = e.target as HTMLInputElement
      const files = target.files
      if (files !== null && files.length > 0) {
        const reader = new FileReader()
        reader.onload = () => {
          if (reader.result) {
            const json = JSON.parse(reader.result.toString())
            updateProject({type: "load", json})

            Object.values(windows).forEach(window => {
              if (window.metadata.type === "drawing") {
                closeWindow(window.windowId)
              }
            })
          }
        }
        reader.readAsText(files[0])
      }
    })
    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
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

  const onDownloadProjectButtonClick = () => {
    const json = JSON.stringify(project, null, 2)
    const blob = new Blob([json], {type: "application/json"})
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = project.name + ".json"
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