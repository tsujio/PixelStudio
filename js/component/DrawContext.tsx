import React, { createContext, useContext, useReducer, useMemo } from 'react'
import Color from 'tsx!lib/color'

export type DrawCtx = {
  tool: string
  color: Color
}

const initialDrawContext: DrawCtx = {
  tool: "pen",
  color: new Color("#000000"),
}

const reducer = (ctx: DrawCtx, action: any): DrawCtx => {
  switch (action.type) {
    case 'changeTool':
      return {
        ...ctx,
        tool: action.tool,
      }
    case 'changeColor':
      return {
        ...ctx,
        color: action.color,
      }
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

const ReactDrawContext = createContext(null)

type Props = {
  children: React.ReactNode
}

export const DrawContextProvider = (props: Props) => {
  const [drawContext, dispatchDrawContext] = useReducer(reducer, initialDrawContext)

  const contextValue = useMemo(() => ({
    drawContext,
    dispatchDrawContext,
  }), [drawContext])

  return (
    <ReactDrawContext.Provider value={contextValue}>
      {props.children}
    </ReactDrawContext.Provider>
  )
}

export const useDrawContext = () => {
  return useContext(ReactDrawContext)
}
