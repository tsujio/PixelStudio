import React, { createContext, useContext, useMemo, useReducer } from 'react'

type WindowSystemState = {
  zoom: number
}

type WindowSystemContextValue = {
  state: WindowSystemState
  updateWindowSystemState: (action: Action) => void
}

const WindowSystemContext = createContext<WindowSystemContextValue | null>(null)

type Action =
  {
    type: "setZoom"
    zoom: number
  }

const reducer = (state: WindowSystemState, action: Action) => {
  switch (action.type) {
    case "setZoom": {
      if (state.zoom === action.zoom) {
        return state
      }
      return {
        ...state,
        zoom: action.zoom,
      }
    }
  }
}

type Props = {
  children: React.ReactNode
}

export const WindowSystemContextProvider = (props: Props) => {
  const [state, updateWindowSystemState] = useReducer(reducer, {zoom: 1.0})

  const contextValue = useMemo(() => ({
    state,
    updateWindowSystemState,
  }), [state])

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
