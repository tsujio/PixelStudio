import React, { createContext, useContext, useMemo, useReducer } from 'react'

type WindowSystemContextValue = {
  windows: Windows,
  openWindow: (top: number, left: number, metadata: WindowMetadata) => void
  closeWindow: (windowId: string) => void
  activateWindow: (windowId: string) => void
  moveWindow: (windowId: string, top: number, left: number) => void
}

const WindowSystemContext = createContext<WindowSystemContextValue | null>(null)

type Window = {
  top: number
  left: number
  zIndex: number
  metadata: WindowMetadata
}

type Windows = {
  [windowId: string]: Window
}

type WindowMetadata =
  {
    type: "drawing"
    drawingId: string
  } |
  {
    type: "toolBox"
  }

type Action =
  {
    type: "open"
    top: number
    left: number
    metadata: WindowMetadata
  } |
  {
    type: "close"
    windowId: string
  } |
  {
    type: "activate"
    windowId: string
  } |
  {
    type: "move"
    windowId: string
    top: number
    left: number
  }

const reducer = (windows: Windows, action: Action): Windows => {
  switch (action.type) {
    case "open": {
      // Activate if a window with speficied drawing id exists
      if (action.metadata.type === "drawing") {
        const drawingId = action.metadata.drawingId
        const kv = Object.entries(windows).find(([_, w]) => w.metadata.type === "drawing" && w.metadata.drawingId === drawingId)
        if (kv !== undefined) {
          return reducer(windows, {type: "activate", windowId: kv[0]})
        }
      }

      if (action.metadata.type === "toolBox") {
        if (Object.values(windows).some(w => w.metadata.type === "toolBox")) {
          return windows
        }
      }

      const windowId = crypto.randomUUID()

      const ws = {
        ...windows,
        [windowId]: {
          top: action.top,
          left: action.left,
          zIndex: 0,
          metadata: action.metadata ?? {},
        }
      }

      return reducer(ws, {type: "activate", windowId})
    }
    case "close": {
      const ws = {...windows}
      delete ws[action.windowId]
      return ws
    }
    case "activate": {
      if (!(action.windowId in windows)) {
        return windows
      }

      const maxZIndex = Math.max(...Object.values(windows).map(w => w.zIndex))
      const zIndex = Number.isFinite(maxZIndex) ? maxZIndex + 1 : 1
      const ws = {
        ...windows,
        [action.windowId]: {
          ...windows[action.windowId],
          zIndex,
        }
      }
      const entries = Object.entries(ws)
        .sort(([_, a], [__, b]) => a.zIndex - b.zIndex)
        .map(([windowId, w], i) => [windowId, {
          ...w,
          zIndex: i + 1,
        }])
      return Object.fromEntries(entries)
    }
    case "move": {
      if (action.windowId in windows) {
        return {
          ...windows,
          [action.windowId]: {
            ...windows[action.windowId],
            top: action.top,
            left: action.left,
          }
        }
      } else {
        return windows
      }
    }
  }
}

type Props = {
  children: React.ReactNode
}

export const WindowSystemContextProvider = (props: Props) => {
  const [windows, updateWindows] = useReducer(reducer, {})

  const contextValue = useMemo(() => ({
    windows,
    openWindow: (top: number, left: number, metadata: WindowMetadata) => {
      updateWindows({type: "open", top, left, metadata})
    },
    closeWindow: (windowId: string) => {
      updateWindows({type: "close", windowId})
    },
    activateWindow: (windowId: string) => {
      updateWindows({type: "activate", windowId})
    },
    moveWindow: (windowId: string, top: number, left: number) => {
      updateWindows({type: "move", windowId, top, left})
    }
  }), [windows])

  return (
    <WindowSystemContext.Provider value={contextValue}>
      {props.children}
    </WindowSystemContext.Provider>
  )
}

export const useWindowSystemContext = () => {
  const value = useContext(WindowSystemContext)
  if (value === null) {
    throw new Error("Not in a window system context")
  }
  return value
}
