import React, { createContext, useContext, useMemo, useCallback, useReducer } from 'react'

type WindowSystemContextValue = {
  windows: Windows,
  openWindow: (top: number, left: number, metadata: WindowMetadata) => string
  closeWindow: (windowId: string) => void
  activateWindow: (windowId: string) => void
  getActiveWindowId: (onlyDrawingWindow: boolean) => string | null
  moveWindow: (windowId: string, top: number, left: number) => void
}

const WindowSystemContext = createContext<WindowSystemContextValue | null>(null)

type Window = {
  windowId: string
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
    windowId: string
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
        const window = Object.values(windows).find(w => w.metadata.type === "drawing" && w.metadata.drawingId === drawingId)
        if (window !== undefined) {
          return reducer(windows, {type: "activate", windowId: window.windowId})
        }
      }

      const ws = {
        ...windows,
        [action.windowId]: {
          windowId: action.windowId,
          top: action.top,
          left: action.left,
          zIndex: 0,
          metadata: action.metadata ?? {},
        }
      }

      return reducer(ws, {type: "activate", windowId: action.windowId})
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

      const orderedWindowIds = Object.values(windows)
        .sort((a, b) => a.zIndex - b.zIndex)
        .map(w => w.windowId)
      const newOrderedWindowIds = orderedWindowIds.filter(windowId => windowId !== action.windowId)
      newOrderedWindowIds.push(action.windowId)
      return Object.fromEntries(newOrderedWindowIds.map((windowId, i) =>
        [windowId, {...windows[windowId], zIndex: i + 1}]
      ))
    }
    case "move": {
      if (action.windowId in windows) {
        const w = windows[action.windowId]
        if (w.top !== action.top || w.left !== action.left) {
          return {
            ...windows,
            [action.windowId]: {
              ...windows[action.windowId],
              top: action.top,
              left: action.left,
            }
          }
        }
      }
      return windows
    }
  }
}

type Props = {
  children: React.ReactNode
}

export const WindowSystemContextProvider = (props: Props) => {
  const [windows, updateWindows] = useReducer(reducer, {})

  const openWindow = useCallback((top: number, left: number, metadata: WindowMetadata) => {
    const windowId = crypto.randomUUID()
    updateWindows({type: "open", windowId, top, left, metadata})
    return windowId
  }, [])

  const closeWindow = useCallback((windowId: string) => {
    updateWindows({type: "close", windowId})
  }, [])

  const activateWindow = useCallback((windowId: string) => {
    updateWindows({type: "activate", windowId})
  }, [])

  const getActiveWindowId = useCallback((onlyDrawingWindow?: boolean) => {
    const ws = Object.values(windows)
      .filter(w => onlyDrawingWindow ? w.metadata.type === "drawing" : true)
    if (Object.keys(ws).length === 0) {
      return null
    }
    return ws.reduce((prev, cur) => prev.zIndex > cur.zIndex ? prev : cur).windowId
  }, [windows])

  const moveWindow = useCallback((windowId: string, top: number, left: number) => {
    updateWindows({type: "move", windowId, top, left})
  }, [])

  const contextValue = useMemo(() => ({
    windows,
    openWindow,
    closeWindow,
    activateWindow,
    getActiveWindowId,
    moveWindow,
  }), [windows, openWindow, closeWindow, activateWindow, getActiveWindowId, moveWindow])

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
