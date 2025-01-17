import React, { createContext, useContext, useReducer, useMemo } from 'react'
import { Color } from '../lib/color'
import { DrawingDataPosition, DrawingDataRect } from '../lib/drawing'

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
      rect: DrawingDataRect
    }
  }
}

type DrawContextValue = {
  drawContext: DrawContext
  changeTool: (tool: DrawTool) => void
  changePenColor: (color: Color) => void
  startSelectArea: (drawingId: string, position: DrawingDataPosition) => void
  expandSelectArea: (drawingId: string, position: DrawingDataPosition) => void
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
    position: DrawingDataPosition
  } |
  {
    type: "expandSelectArea"
    drawingId: string
    position: DrawingDataPosition
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
            rect: {
              start: {...action.position},
              end: {...action.position},
            },
          }
        }
      }
    }
    case "expandSelectArea": {
      const area = drawContext.select.area
      if (area === undefined || area.drawingId !== action.drawingId) {
        drawContext = reducer(drawContext, {type: "startSelectArea", drawingId: action.drawingId, position: action.position})
      }
      return {
        ...drawContext,
        select: {
          ...drawContext.select,
          area: {
            ...drawContext.select.area!,
            end: {...action.position},
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
    startSelectArea: (drawingId: string, position: DrawingDataPosition) => updateDrawContext({type: "startSelectArea", drawingId, position}),
    expandSelectArea: (drawingId: string, position: DrawingDataPosition) => updateDrawContext({type: "expandSelectArea", drawingId, position}),
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
