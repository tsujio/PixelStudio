import React from 'react'
import Grid from 'tsx!component/Grid'
import ColorPicker from 'tsx!component/ColorPicker'
import { useDrawContext } from 'tsx!component/DrawContext'

const tools = [
  {id: "pen", description: "Pen"},
  {id: "select", description: "Select area"}
]

type Props = {}

export default function ToolBox(props: Props) {
  const { drawContext, dispatchDrawContext } = useDrawContext()

  const onToolChange = (e: any) => {
    dispatchDrawContext({type: "changeTool", tool: e.target.value})
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
      <ColorPicker />
    </Grid>
  </>
}
