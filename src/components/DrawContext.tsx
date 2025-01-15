import React, { createContext, useContext, useReducer, useMemo } from 'react'
import { Color } from '../lib/color'

export type DrawTool = "pen" | "eraser" | "select"

type DrawContext = {
  tool: DrawTool
  pen: {
    color: Color
  }
  eraser: {}
  select: {
    area?: {
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
}

type DrawContextValue = {
  drawContext: DrawContext
  changeTool: (tool: DrawTool) => void
  changePenColor: (color: Color) => void
  startSelectArea: (drawingId: string, rowIndex: number, columnIndex: number) => void
  expandSelectArea: (drawingId: string, rowIndex: number, columnIndex: number) => void
  clearSelectArea: (drawingId: string) => void
}

const initialDrawContext: DrawContext = {
  tool: "pen",
  pen: {
    color: new Color("#000000"),
  },
  eraser: {},
  select: {},
}

type Action =
  {
    type: "changeTool"
    tool: DrawTool
  } |
  {
    type: "changePenColor"
    color: Color
  } |
  {
    type: "startSelectArea"
    drawingId: string
    rowIndex: number
    columnIndex: number
  } |
  {
    type: "expandSelectArea"
    drawingId: string
    rowIndex: number
    columnIndex: number
  } |
  {
    type: "clearSelectArea"
    drawingId: string
  }

const reducer = (drawContext: DrawContext, action: Action) => {
  switch (action.type) {
    case "changeTool": {
      return {
        ...drawContext,
        tool: action.tool,
      }
    }
    case "changePenColor": {
      return {
        ...drawContext,
        pen: {
          ...drawContext.pen,
          color: action.color,
        }
      }
    }
    case "startSelectArea": {
      return {
        ...drawContext,
        select: {
          ...drawContext.select,
          area: {
            drawingId: action.drawingId,
            start: {
              rowIndex: action.rowIndex,
              columnIndex: action.columnIndex,
            },
            end: {
              rowIndex: action.rowIndex,
              columnIndex: action.columnIndex,
            }
          }
        }
      }
    }
    case "expandSelectArea": {
      const area = drawContext.select.area
      if (area === undefined || area.drawingId !== action.drawingId) {
        drawContext = reducer(drawContext, {type: "startSelectArea", drawingId: action.drawingId, rowIndex: action.rowIndex, columnIndex: action.columnIndex})
      }
      return {
        ...drawContext,
        select: {
          ...drawContext.select,
          area: {
            ...drawContext.select.area!,
            end: {
              rowIndex: action.rowIndex,
              columnIndex: action.columnIndex,
            }
          }
        }
      }
    }
    case "clearSelectArea": {
      return {
        ...drawContext,
        select: {
          ...drawContext.select,
          area: undefined,
        }
      }
    }
  }
}

const ReactDrawContext = createContext<DrawContextValue | null>(null)

type Props = {
  children: React.ReactNode
}

export const DrawContextProvider = (props: Props) => {
  const [drawContext, updateDrawContext] = useReducer(reducer, initialDrawContext)

  const contextValue = useMemo(() => ({
    drawContext,
    changeTool: (tool: DrawTool) => updateDrawContext({type: "changeTool", tool}),
    changePenColor: (color: Color) => updateDrawContext({type: "changePenColor", color}),
    startSelectArea: (drawingId: string, rowIndex: number, columnIndex: number) => updateDrawContext({type: "startSelectArea", drawingId, rowIndex, columnIndex}),
    expandSelectArea: (drawingId: string, rowIndex: number, columnIndex: number) => updateDrawContext({type: "expandSelectArea", drawingId, rowIndex, columnIndex}),
    clearSelectArea: (drawingId: string) => updateDrawContext({type: "clearSelectArea", drawingId}),
  }), [drawContext])

  return (
    <ReactDrawContext.Provider value={contextValue}>
      {props.children}
    </ReactDrawContext.Provider>
  )
}

export const useDrawContext = () => {
  const value = useContext(ReactDrawContext)
  if (value === null) {
    throw new Error("Not in a draw context")
  }
  return value
}
