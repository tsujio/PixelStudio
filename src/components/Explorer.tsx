import { useEffect, useRef, useState } from "react"
import { useProjectContext } from "./ProjectContext"
import { ExplorerItem } from "./ExplorerItem"
import { IconButton } from "./IconButton"
import { Menu } from "./Menu"
import { MenuItem } from "./MenuItem"
import { TextField } from "./TextField"
import { createFile, openFile, supportFileSystemAPI, writeToFile } from "../lib/filesystem"
import { Drawing } from "../lib/drawing"
import { Icon } from "./Icon"
import { useBoardContext } from "./BoardContext"

type Props = {
  sidebarWidth: number | undefined
}

export function Explorer(props: Props) {
  const { project, projectHistory, updateProject } = useProjectContext()
  const { boardNavigation } = useBoardContext()

  const isProjectClean = projectHistory.history[projectHistory.current].clean

  const drawings = Object.values(project.drawings)
  drawings.sort((a, b) => a.name.localeCompare(b.name))

  const [projectMenuButtonElement, setProjectMenuButtonElement] = useState<HTMLElement | null>(null)

  const onProjectMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setProjectMenuButtonElement(e.nativeEvent.target as HTMLElement)
  }

  const onProjectMenuClose = () => {
    setProjectMenuButtonElement(null)
  }

  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(null)

  const onNewProjectButtonClick = () => {
    if (isProjectClean || window.confirm(`You have unsaved changes that will be lost.\nAre you sure you want to open the new project?`)) {
      updateProject({type: "newProject"})
      setFileHandle(null)
    }
    setProjectMenuButtonElement(null)
  }

  const onOpenProjectButtonClick = async () => {
    const {fileHandle, contents} = await openFile()
    if (isProjectClean || window.confirm(`You have unsaved changes that will be lost.\nAre you sure you want to open the new project?`)) {
      const json = JSON.parse(contents)
      updateProject({type: "load", json})
      setFileHandle(fileHandle)
    }
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
      await writeToFile(fileHandle, JSON.stringify(project))
      updateProject({type: "markAsClean"})
      setShowSavedIcon(true)
    }
  }

  const onSaveAsProjectButtonClick = async () => {
    const json = JSON.stringify(project)
    const fileHandle = await createFile(json, project.nameToDownload)
    setFileHandle(fileHandle)
    updateProject({type: "markAsClean"})
    setShowSavedIcon(true)
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

    updateProject({type: "markAsClean"})
    setShowSavedIcon(true)
  }

  const openPanelPosition: [number, number] = [
    boardNavigation.perspective[0] + ((props.sidebarWidth ?? 0) + 20) / boardNavigation.zoom,
    boardNavigation.perspective[1] + 60 / boardNavigation.zoom,
  ]

  const onAddDrawingButtonClick = () => {
    const drawing = Drawing.create(project.getUniqueDrawingName())
    const [x, y] = openPanelPosition
    updateProject({type: "addDrawing", drawing, position: {x, y}})
  }

  const [showSavedIcon, setShowSavedIcon] = useState(false)
  if (showSavedIcon && !isProjectClean) {
    setShowSavedIcon(false)
  }

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

  // HACK: `overscroll-behavior: none` does not work on Android chrome if `overflow: scroll` is set.
  //       So enable them only if overflow is detected by observing `scrollHeight`.
  const [explorerItemContainerOverflow, setExplorerItemContainerOverflow] = useState(false)
  const explorerItemContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (explorerItemContainerRef.current) {
      const update = () => {
        const el = explorerItemContainerRef.current
        if (el) {
          setExplorerItemContainerOverflow(el.scrollHeight > el.clientHeight)
        }
      }
      update()
      const o = new MutationObserver(update)
      o.observe(explorerItemContainerRef.current, {childList: true})
      return () => {
        o.disconnect()
      }
    }
  }, [])

  return (
    <div style={{display: "grid", gridTemplateRows: "auto minmax(0, 1fr)"}}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
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
          {showSavedIcon &&
          <Icon
            icon="check"
            size="small"
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
            // See explorerItemContainerOverflow declaration
            ...(explorerItemContainerOverflow ? {overflowY: "scroll", overscrollBehavior: "none"} : {}),
          }}
        >
          {drawings && drawings.map(drawing =>
            <ExplorerItem
              key={drawing.id}
              drawing={drawing}
              sidebarWidth={props.sidebarWidth}
              openPanelPosition={openPanelPosition}
            />
          )}
        </div>
      </div>
    </div>
  )
}
