import React, { useState, useReducer, useCallback } from 'react'
import Canvas from 'tsx!component/Canvas'
import Window from 'tsx!component/Window'
import ToolBox from 'tsx!component/ToolBox'
import Explorer from 'tsx!component/Explorer'
import { useProjectContext } from 'tsx!component/ProjectContext'

type WindowPosition = {
  top: number
  left: number
} | {
  top: number
  right: number
}

type WindowPositions = {[key:string]: WindowPosition}

const windowPositionsReducer = (windowPositions: WindowPositions, action: any): WindowPositions => {
  switch (action.type) {
    case "set":
      return {
        ...windowPositions,
        ...{[action.windowId]: action.position},
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

  if (!project) {
    return null
  }

  return <>
    <Window
      id="toolBox"
      top={windowPositions["toolBox"]?.top}
      left={windowPositions["toolBox"]?.left}
      onPositionUpdate={updateWindowPositionsCallback}
    >
      <ToolBox />
    </Window>
    {project.drawings.map(drawing =>
      <Window
        key={drawing.id}
        id={drawing.id}
        top={windowPositions[drawing.id]?.top}
        left={windowPositions[drawing.id]?.left}
        onPositionUpdate={updateWindowPositionsCallback}
      >
        <Canvas
          pixelSize={10}
          drawing={drawing}
          saving={saving}
          //onDataURLGenerate={onDataURLGenerate}
        />
      </Window>
    )}
    <Window
      id="explorer"
      top={windowPositions["explorer"]?.top}
      left={windowPositions["explorer"]?.left}
      right={windowPositions["explorer"]?.right}
      onPositionUpdate={updateWindowPositionsCallback}
    >
      <Explorer />
    </Window>
  </>
}
