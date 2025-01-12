import React, { useState } from 'react'
import { useProjectContext } from 'tsx!component/ProjectContext'
import ExplorerDrawingItem from 'tsx!component/ExplorerDrawingItem'

type Props = {}

export default function Explorer(props: Props) {
  const { project, updateProject } = useProjectContext()

  const onNewDrawingButtonClick = () => {
    updateProject({type: "createDrawing"})
  }

  return <>
    <div>
      <div>
        <button onClick={onNewDrawingButtonClick}>New</button>
      </div>
      <div>
        {project.drawings.map(drawing =>
          <ExplorerDrawingItem
            key={drawing.id}
            drawing={drawing}
          />
        )}
      </div>
    </div>
  </>
}
