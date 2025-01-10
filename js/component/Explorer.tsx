import React from 'react'
import { useProjectContext } from 'tsx!component/ProjectContext'

type Props = {}

export default function Explorer(props: Props) {
  const { project, updateProject } = useProjectContext()

  return <>
    <div>
      {project.drawings.map(drawing =>
        <div key={drawing.id}>{drawing.name}</div>
      )}
    </div>
  </>
}
