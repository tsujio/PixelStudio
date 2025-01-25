export const makeDragStartCallback = <T,>(
  onDragStart?: (e: T) => {
    onDragging?: (e: PointerEvent) => void,
    onDragEnd?: (e: PointerEvent) => void,
  } | undefined,
) => {
  return (e: T) => {
    const ret = onDragStart ? onDragStart(e) : undefined
    const { onDragging, onDragEnd } = ret ?? {}

    const onPointerMove = (e: PointerEvent) => {
      if (onDragging) {
        onDragging(e)
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      document.removeEventListener("pointermove", onPointerMove)
      document.removeEventListener("pointerup", onPointerUp)

      if (onDragEnd) {
        onDragEnd(e)
      }
    }

    document.addEventListener("pointermove", onPointerMove)
    document.addEventListener("pointerup", onPointerUp)

    // Prevent dragstart event since it conflicts with pointermove
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
    }
  }
}
