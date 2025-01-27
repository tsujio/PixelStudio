import React, { createContext, useContext, useMemo } from 'react'

type WindowSystemContextValue = {}

const WindowSystemContext = createContext<WindowSystemContextValue | null>(null)

type Props = {
  children: React.ReactNode
}

export const WindowSystemContextProvider = (props: Props) => {
  const contextValue = useMemo(() => ({
  }), [])

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
