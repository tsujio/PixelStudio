import React, { createContext, useContext, useMemo, useCallback, useReducer } from 'react'

type WindowSystemContextValue = {
  windows: Windows,
  openWindow: (top: number, left: number, metadata: WindowMetadata) => string
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
        const kv = Object.entries(windows).find(([_, w]) => w.metadata.type === "drawing" && w.metadata.drawingId === drawingId)
        if (kv !== undefined) {
          return reducer(windows, {type: "activate", windowId: kv[0]})
        }
      }

      const ws = {
        ...windows,
        [action.windowId]: {
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

      const orderedWindowIds = Object.entries(windows)
        .sort(([_, a], [__, b]) => a.zIndex - b.zIndex)
        .map(([windowId, _]) => windowId)
      const newOrderedWindowIds = orderedWindowIds.filter(windowId => windowId !== action.windowId)
      newOrderedWindowIds.push(action.windowId)
      return Object.fromEntries(newOrderedWindowIds.map((windowId, i) =>
        [windowId, {...windows[windowId], zIndex: i + 1}]
      ))
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

  const moveWindow = useCallback((windowId: string, top: number, left: number) => {
    updateWindows({type: "move", windowId, top, left})
  }, [])

  const contextValue = useMemo(() => ({
    windows,
    openWindow,
    closeWindow,
    activateWindow,
    moveWindow,
  }), [windows, openWindow, closeWindow, activateWindow, moveWindow])

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
