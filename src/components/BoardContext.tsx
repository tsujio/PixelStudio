import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

type BoardNavigation = {
  perspective: [number, number]
  zoom: number
  perspectiveMoveTo?: {
    destination: [number, number]
    duration: number
  }
}

type BoardContextValue = {
  boardNavigation: BoardNavigation
  updateBoardNavigation: (action: Action) => void
}

const BoardContext = createContext<BoardContextValue | null>(null)

type Action =
  {
    type: "setPerspective"
    perspective: [number, number]
    duration?: number
  } |
  {
    type: "setPerspectiveInternal"
    perspective: [number, number]
  } |
  {
    type: "setZoom"
    zoom: number
    basePoint: [number, number]
  }

const reducer = (boardNavigation: BoardNavigation, action: Action): BoardNavigation => {
  switch (action.type) {
    case "setPerspective": {
      return {
        ...boardNavigation,
        ...(
          action.duration !== undefined ?
          {
            perspectiveMoveTo: {
              destination: action.perspective,
              duration: action.duration,
            }
          } :
          {
            perspective: action.perspective,
            perspectiveMoveTo: undefined,
          }
        )
      }
    }
    case "setPerspectiveInternal": {
      return {
        ...boardNavigation,
        perspective: action.perspective,
      }
    }
    case "setZoom": {
      const [b1, p1, z1, z2]  = [action.basePoint, boardNavigation.perspective, boardNavigation.zoom, action.zoom]
      const perspective = [
        // b1 == (x - p1) * z1
        // b2 == (x - p2) * z2
        // b1 == b2 <=> p2 == b1 / z1 + p1 - b1 / z2
        b1[0] / z1 + p1[0] - b1[0] / z2,
        b1[1] / z1 + p1[1] - b1[1] / z2,
      ] as [number, number]
      return reducer(
        {
          ...boardNavigation,
          zoom: action.zoom,
        },
        {
          type: "setPerspective",
          perspective,
        }
      )
    }
  }
}

type Props = {
  children: React.ReactNode
}

const initialContextValue: BoardNavigation = {
  perspective: [-9999, -9999],
  zoom: 1.0,
}

export const BoardContextProvider = (props: Props) => {
  const [boardNavigation, updateBoardNavigation] = useReducer(reducer, initialContextValue)

  useEffect(() => {
    if (boardNavigation.perspectiveMoveTo) {
      const { destination, duration } = boardNavigation.perspectiveMoveTo
      let i = 0
      const timer = setInterval(() => {
        const count = duration / 1000 * 60
        if (i < count) {
          const deltaX = (destination[0] - boardNavigation.perspective[0]) / count
          const deltaY = (destination[1] - boardNavigation.perspective[1]) / count
          const perspective: [number, number] = [boardNavigation.perspective[0] + deltaX * i, boardNavigation.perspective[1] + deltaY * i]
          updateBoardNavigation({type: "setPerspectiveInternal", perspective})
          i++
        } else {
          clearInterval(timer)
          updateBoardNavigation({type: "setPerspectiveInternal", perspective: destination})
        }
      }, 1000 / 60)
      return () => {
        clearInterval(timer)
      }
    }
  }, [boardNavigation.perspectiveMoveTo])

  const contextValue = useMemo(() => ({
    boardNavigation,
    updateBoardNavigation,
  }), [boardNavigation])

  return (
    <BoardContext.Provider value={contextValue}>
      {props.children}
    </BoardContext.Provider>
  )
}

export const useBoardContext = () => {
  const value = useContext(BoardContext)
  if (value === null) {
    throw new Error("Not in a board context")
  }
  return value
}
