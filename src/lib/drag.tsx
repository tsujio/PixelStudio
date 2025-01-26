export const makeDragStartCallback = <T extends HTMLElement,>(
  onDragStart?: (e: React.PointerEvent<T>) => {
    onDragging?: (e: PointerEvent) => void,
    onDragEnd?: (e: PointerEvent) => void,
  } | undefined,
  disablePointerCapture?: boolean,
) => {
  return (e: React.PointerEvent<T>) => {
    if (!e.isPrimary) {
      return
    }

    const target = e.currentTarget

    if (disablePointerCapture !== true) {
      target.setPointerCapture(e.pointerId)
    }

    const ret = onDragStart ? onDragStart(e) : undefined
    const { onDragging, onDragEnd } = ret ?? {}

    const onPointerMove = (e: PointerEvent) => {
      if (!e.isPrimary) {
        return
      }

      if (onDragging) {
        onDragging(e)
      }
    }

    const cleanupListeners = (e: PointerEvent) => {
      target.removeEventListener("pointermove", onPointerMove)
      target.removeEventListener("pointerup", onPointerUp)
      target.removeEventListener("pointercancel", cleanupListeners)

      if (disablePointerCapture !== true) {
        target.releasePointerCapture(e.pointerId)
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!e.isPrimary) {
        return
      }

      cleanupListeners(e)

      if (onDragEnd) {
        onDragEnd(e)
      }
    }

    target.addEventListener("pointermove", onPointerMove)
    target.addEventListener("pointerup", onPointerUp)
    target.addEventListener("pointercancel", cleanupListeners)

    // Prevent dragstart event since it conflicts with pointermove
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
    }
  }
}
