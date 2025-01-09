import React, { useState } from 'react'
import Canvas from 'tsx!component/Canvas'
import Window from 'tsx!component/Window'
import ToolBox from 'tsx!component/ToolBox'
import { useProjectContext } from 'tsx!component/ProjectContext'

type Props = {}

export default function ProjectComponent(props: Props) {
  const [saving, setSaving] = useState<boolean>(false)

  const { project, updateProject } = useProjectContext()

  if (!project) {
    return null
  }

  return <>
    <Window>
      <ToolBox />
    </Window>
    {project.drawings.map(drawing =>
      <Window key={drawing.id}>
        <Canvas
          pixelSize={10}
          drawing={drawing}
          saving={saving}
          //onDataURLGenerate={onDataURLGenerate}
        />
      </Window>
    )}
  </>
}
