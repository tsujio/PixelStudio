import React, { useState } from 'react'
import NavigationBar from 'tsx!component/NavigationBar'
import Canvas from 'tsx!component/Canvas'
import ColorPicker from 'tsx!component/ColorPicker'
import Window from 'tsx!component/Window'
import Project from 'tsx!lib/project'
import Color from 'tsx!lib/color'

export default function App() {
  const [project, setProject] = useState<Project|null>(() => {
    return Project.create()
  })

  const [color, setColor] = useState<Color>(() => {
    return new Color("#000000")
  })

  const [mouseDown, setMouseDown] = useState<boolean>(false)

  const [saving, setSaving] = useState<boolean>(false)

  const onMouseDown = (drawingId: string, columnIndex: number, rowIndex: number) => {
    setProject(project => {
      const drawing = project.getDrawing(drawingId)
      drawing.setPixel(rowIndex, columnIndex, color)
      return project.clone()
    })

    setMouseDown(true)
  }

  const onMouseUp = (drawingId: string, columnIndex: number, rowIndex: number) => {
    setMouseDown(false)
  }

  const onMouseMove = (drawingId: string, columnIndex: number, rowIndex: number) => {
    if (mouseDown) {
      setProject(project => {
        const drawing = project.getDrawing(drawingId)
        drawing.setPixel(rowIndex, columnIndex, color)
        return project.clone()
      })
    }
  }

  const onColorPick = (color: string) => {
    setColor(new Color(color))
  }

  const onSaveButtonClick = () => {
    if (!saving) {
      setSaving(true)
    }
  }

  const onDataURLGenerate = (url: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = "foo.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setSaving(false)
  }

  return <>
    <NavigationBar
      onSaveButtonClick={onSaveButtonClick}
    />
    <Window>
      <ColorPicker
        value={color.rgb}
        onColorPick={onColorPick}
      />
    </Window>
    {project && project.drawings.map(drawing =>
      <Window key={drawing.id}>
        <Canvas
          pixelSize={10}
          drawing={drawing}
          saving={saving}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          onDataURLGenerate={onDataURLGenerate}
        />
      </Window>
    )}
  </>
}
