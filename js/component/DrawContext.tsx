import React, { createContext, useContext, useReducer, useMemo } from 'react'
import Color from 'tsx!lib/color'

export type DrawCtx = {
  tool: string
  color: Color
  select?: {
    drawingId: string
    start: {
      rowIndex: number
      columnIndex: number
    },
    end: {
      rowIndex: number
      columnIndex: number
    },
  }
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
    case 'startSelect': {
      const { drawingId, rowIndex, columnIndex } = action
      return {
        ...ctx,
        select: {
          drawingId,
          start: {
            rowIndex,
            columnIndex,
          },
          end: {
            rowIndex,
            columnIndex,
          }
        },
      }
    }
    case 'expandSelect': {
      const { drawingId, rowIndex, columnIndex } = action
      if (ctx.select &&
        ctx.select.drawingId === drawingId &&
        ctx.select.end.rowIndex === rowIndex &&
        ctx.select.end.columnIndex === columnIndex) {
        return ctx
      }

      return {
        ...ctx,
        select: {
          ...(ctx.select || {
            drawingId,
            start: {
              rowIndex,
              columnIndex,
            }
          }),
          end: {
            rowIndex,
            columnIndex,
          }
        },
      }
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
  const [drawContext, updateDrawContext] = useReducer(reducer, initialDrawContext)

  const contextValue = useMemo(() => ({
    drawContext,
    updateDrawContext,
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
