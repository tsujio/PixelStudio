import { useRef } from "react"

type GestureCallbacks = {
  onDragMove?: (e: PointerEvent) => void,
  onDragEnd?: (e: PointerEvent) => void,
  onPinchStart?: (e1: PointerEvent, e2: PointerEvent, triggerEvent: PointerEvent) => void,
  onPinchMove?: (e1: PointerEvent, e2: PointerEvent, triggerEvent: PointerEvent) => void,
  onPinchEnd?: (e1: PointerEvent, e2: PointerEvent, triggerEvent: PointerEvent) => void,
}

export const useGesture = <T extends HTMLElement,>(
  onGestureStart: (e: React.PointerEvent<T>) => GestureCallbacks| undefined,
) => {
  const eventsRef = useRef<(PointerEvent | null)[]>([])
  const callbacksRef = useRef<GestureCallbacks>({})

  return (e: React.PointerEvent<T>) => {
    if (e.isPrimary) {
      if (eventsRef.current.some(e => e !== null)) {
        console.warn("Found not cleaned up events")
      }

      callbacksRef.current = {}
      eventsRef.current = []
    }

    if (eventsRef.current.length >= 2) {
      return
    }

    eventsRef.current = [...eventsRef.current, e.nativeEvent]

    const target = e.currentTarget
    target.setPointerCapture(e.pointerId)

    if (eventsRef.current.length === 2 && eventsRef.current[0] && eventsRef.current[1]) {
      // Pinch start
      if (callbacksRef.current.onPinchStart) {
        callbacksRef.current.onPinchStart(eventsRef.current[0], eventsRef.current[1], e.nativeEvent)
      }
      return
    }

    // Drag start

    callbacksRef.current = onGestureStart(e) ?? {}

    const onPointerMove = (e: PointerEvent) => {
      const index = eventsRef.current.findIndex(ev => ev?.pointerId === e.pointerId)
      if (index !== -1) {
        const events = [...eventsRef.current]
        events[index] = e
        eventsRef.current = events
      }

      if (index === 0 && callbacksRef.current.onDragMove) {
        callbacksRef.current.onDragMove(e)
      }

      if (eventsRef.current.length === 2 && eventsRef.current[0] && eventsRef.current[1] && callbacksRef.current.onPinchMove) {
        callbacksRef.current.onPinchMove(eventsRef.current[0], eventsRef.current[1], e)
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      const index = eventsRef.current.findIndex(ev => ev && ev.pointerId === e.pointerId)
      if (index !== -1) {
        const events = [...eventsRef.current]
        events[index] = e
        eventsRef.current = events
      }

      if (eventsRef.current.length === 2 && eventsRef.current[0] && eventsRef.current[1] && callbacksRef.current.onPinchEnd) {
        callbacksRef.current.onPinchEnd(eventsRef.current[0], eventsRef.current[1], e)
      }

      if (index === 0 && callbacksRef.current.onDragEnd) {
        callbacksRef.current.onDragEnd(e)
      }

      if (index !== -1) {
        const events = [...eventsRef.current]
        events[index] = null
        eventsRef.current = events
      }

      target.releasePointerCapture(e.pointerId)

      if (eventsRef.current.every(e => e === null)) {
        target.removeEventListener("pointermove", onPointerMove)
        target.removeEventListener("pointerup", onPointerUp)
      }
    }

    target.addEventListener("pointermove", onPointerMove)
    target.addEventListener("pointerup", onPointerUp)

    // Prevent dragstart event since it conflicts with pointermove
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
    }
  }
}

export const makeDragStartCallback = <T extends HTMLElement,>(
  onDragStart: (e: React.PointerEvent<T>) => {
    onDragging?: (e: PointerEvent) => void,
    onDragEnd?: (e: PointerEvent) => void,
  } | undefined,
) => useGesture((e: React.PointerEvent<T>) => {
  const ret = onDragStart ? onDragStart(e) : undefined
  const { onDragging, onDragEnd } = ret ?? {}
  return {onDragMove: onDragging, onDragEnd}
})
