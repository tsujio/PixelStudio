export const makeDragStartCallback = <T extends HTMLElement,>(
  onDragStart?: (e: React.PointerEvent<T>) => {
    onDragging?: (e: PointerEvent) => void,
    onDragEnd?: (e: PointerEvent) => void,
  } | undefined,
) => {
  return (e: React.PointerEvent<T>) => {
    e.preventDefault()

    const target = e.currentTarget

    target.setPointerCapture(e.pointerId)

    const ret = onDragStart ? onDragStart(e) : undefined
    const { onDragging, onDragEnd } = ret ?? {}

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
    }

    const onPointerMove = (e: PointerEvent) => {
      e.preventDefault()

      if (onDragging) {
        onDragging(e)
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      e.preventDefault()

      target.removeEventListener("touchmove", onTouchMove)
      target.removeEventListener("pointermove", onPointerMove)
      target.removeEventListener("pointerup", onPointerUp)
      target.releasePointerCapture(e.pointerId)

      if (onDragEnd) {
        onDragEnd(e)
      }
    }

    target.addEventListener("touchmove", onTouchMove)
    target.addEventListener("pointermove", onPointerMove)
    target.addEventListener("pointerup", onPointerUp)

    // Prevent dragstart event since it conflicts with pointermove
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
    }
  }
}
