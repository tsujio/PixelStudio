import { useEffect } from "react"
import { useWindowContext } from "./Window"
import { Canvas } from "./Canvas"
import { Drawing as DrawingClass } from "../lib/drawing"

type Props = {
  drawing: DrawingClass
}

export function Drawing(props: Props) {
  const { setWindowName } = useWindowContext()

  useEffect(() => {
    setWindowName(`${props.drawing.name} (${props.drawing.rowCount} x ${props.drawing.columnCount})`)
  }, [setWindowName, props.drawing.name, props.drawing.rowCount, props.drawing.columnCount])

  return (
    <Canvas
      drawing={props.drawing}
      pixelSize={10}
    />
  )
}
