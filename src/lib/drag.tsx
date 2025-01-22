export const makeDragStartCallback = <T,>(
  onDragStart?: (e: T) => {
    onDragging?: (e: MouseEvent) => void,
    onDragEnd?: (e: MouseEvent) => void,
  } | undefined,
) => {
  return (e: T) => {
    const ret = onDragStart ? onDragStart(e) : undefined
    const { onDragging, onDragEnd } = ret ?? {}

    const onMouseMove = (e: MouseEvent) => {
      if (onDragging) {
        onDragging(e)
      }
    }

    const onMouseUp = (e: MouseEvent) => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)

      if (onDragEnd) {
        onDragEnd(e)
      }
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)

    // Prevent dragstart event since it conflicts with mousemove
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
    }
  }
}
