import React, { useState, useReducer, useCallback } from 'react'
import Canvas from 'tsx!component/Canvas'
import Window from 'tsx!component/Window'
import ToolBox from 'tsx!component/ToolBox'
import Explorer from 'tsx!component/Explorer'
import { useProjectContext } from 'tsx!component/ProjectContext'

type WindowPosition = {
  top: number
  left: number
  zIndex?: number
} | {
  top: number
  right: number
  zIndex?: number
}

type WindowPositions = {[key:string]: WindowPosition}

const windowPositionsReducer = (windowPositions: WindowPositions, action: any): WindowPositions => {
  switch (action.type) {
    case "set": {
      const { windowId, position } = action
      return {
        ...windowPositions,
        ...{[windowId]: {...windowPositions[windowId], ...position}},
      }
    }
    case 'activate': {
      const { windowId } = action
      const newZIndex = 1 + Math.max(...Object.values(windowPositions).map(v => v.zIndex ?? 0))
      const newWindowPositions = {
        ...windowPositions,
        ...{[windowId]: {...windowPositions[windowId], zIndex: newZIndex}},
      } as WindowPositions
      const values = Object.values(newWindowPositions).filter(v => v.zIndex !== undefined)
      values.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
      values.forEach((v, i) => v.zIndex = i + 1)
      return newWindowPositions
    }
    default:
      throw new Error(`Unknown action: ${action.type}`)
  }
}

const initialWindowPositions: WindowPositions = {
  "toolBox": {
    top: 100,
    left: 0,
  },
  "explorer": {
    top: 100,
    right: 0,
  }
}

type Props = {}

export default function ProjectComponent(props: Props) {
  const [saving, setSaving] = useState<boolean>(false)

  const { project, updateProject } = useProjectContext()

  const [windowPositions, updateWindowPositions] = useReducer(windowPositionsReducer, initialWindowPositions)

  const updateWindowPositionsCallback = useCallback((windowId: string, top: number, left: number) => {
    updateWindowPositions({type: "set", windowId, position: {top, left}})
  }, [])

  const activateWindowCallback = useCallback((windowId: string) => {
    updateWindowPositions({type: "activate", windowId})
  }, [])

  if (!project) {
    return null
  }

  return <>
    <Window
      id="toolBox"
      top={windowPositions["toolBox"]?.top}
      left={windowPositions["toolBox"]?.left}
      zIndex={windowPositions["toolBox"]?.zIndex}
      onPositionUpdate={updateWindowPositionsCallback}
      onActivateWindow={activateWindowCallback}
    >
      <ToolBox />
    </Window>
    {project.drawings.map(drawing =>
      <Window
        key={drawing.id}
        id={drawing.id}
        top={windowPositions[drawing.id]?.top}
        left={windowPositions[drawing.id]?.left}
        zIndex={windowPositions[drawing.id]?.zIndex}
        onPositionUpdate={updateWindowPositionsCallback}
        onActivateWindow={activateWindowCallback}
      >
        <Canvas
          pixelSize={10}
          drawing={drawing}
          saving={saving}
        />
      </Window>
    )}
    <Window
      id="explorer"
      top={windowPositions["explorer"]?.top}
      left={windowPositions["explorer"]?.left}
      right={windowPositions["explorer"]?.right}
      zIndex={windowPositions["explorer"]?.zIndex}
      onPositionUpdate={updateWindowPositionsCallback}
      onActivateWindow={activateWindowCallback}
    >
      <Explorer />
    </Window>
  </>
}
