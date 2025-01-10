import React from 'react'
import Grid from 'tsx!component/Grid'
import { useDrawContext } from 'tsx!component/DrawContext'
import ToolBoxPenOptions from 'tsx!component/ToolBoxPenOptions'
import ToolBoxSelectOptions from 'tsx!component/ToolBoxSelectOptions'

const tools = [
  {id: "pen", description: "Pen"},
  {id: "select", description: "Select area"}
]

type Props = {}

export default function ToolBox(props: Props) {
  const { drawContext, updateDrawContext } = useDrawContext()

  const onToolChange = (e: any) => {
    updateDrawContext({type: "changeTool", tool: e.target.value})
  }

  return <>
    <Grid columnCount={3}>
      {tools.map(t =>
        <div key={t.id}>
          <label for={t.id}>
            {t.description}
            <input
              type="radio"
              name="tool"
              id={t.id}
              value={t.id}
              checked={drawContext.tool === t.id}
              onChange={onToolChange}
            />
          </label>
        </div>
      )}
    </Grid>
    {drawContext.tool === "pen" && <ToolBoxPenOptions />}
    {drawContext.tool === "select" && <ToolBoxSelectOptions />}
  </>
}
