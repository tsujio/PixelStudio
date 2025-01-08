import React, { useState } from 'react'
import NavigationBar from 'tsx!component/NavigationBar'
import Canvas from 'tsx!component/Canvas'
import ColorPicker from 'tsx!component/ColorPicker'
import Window from 'tsx!component/Window'

export default function App() {
  const [data, setData] = useState<string[][]>(() => {
    const data: string[][] = []
    for (let i = 0; i < 48; i++) {
      const row: string[] = []
      for (let j = 0; j < 64; j++) {
        row.push("")
      }
      data.push(row)
    }
    return data
  })

  const [color, setColor] = useState<string>("#000000")

  const [saving, setSaving] = useState<boolean>(false)

  const onMouseDown = (columnIndex: number, rowIndex: number) => {
    setData(data => {
      const newData = data.map(row => [...row])
      newData[rowIndex][columnIndex] = color
      return newData
    })
  }

  const onColorPick = (color: string) => {
    setColor(color)
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
        value={color}
        onColorPick={onColorPick}
      />
    </Window>
    <Window>
      <Canvas
        pixelSize={10}
        rowCount={48}
        columnCount={64}
        data={data}
        saving={saving}
        onMouseDown={onMouseDown}
        onDataURLGenerate={onDataURLGenerate}
      />
    </Window>
  </>
}
