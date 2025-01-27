import { useRef } from "react"

type GestureCallbacks = {
  onDragMove?: (e: PointerEvent) => void,
  onDragEnd?: (e: PointerEvent) => void,
  onPinchStart?: (e1: PointerEvent, e2: PointerEvent, triggerEvent: PointerEvent) => void,
  onPinchMove?: (e1: PointerEvent, e2: PointerEvent, triggerEvent: PointerEvent) => void,
  onPinchEnd?: (e1: PointerEvent, e2: PointerEvent, triggerEvent: PointerEvent) => void,
}

export const useGesture1 = <T extends HTMLElement,>(
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

    callbacksRef.current = {...onGestureStart(e)}

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
        callbacksRef.current.onPinchEnd = undefined
      }

      if (index === 0 && callbacksRef.current.onDragEnd) {
        callbacksRef.current.onDragEnd(e)
        callbacksRef.current.onDragEnd = undefined
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
        target.removeEventListener("pointercancel", onPointerUp)
        target.removeEventListener("pointerout", onPointerUp)
      }
    }

    target.addEventListener("pointermove", onPointerMove)
    target.addEventListener("pointerup", onPointerUp)
    target.addEventListener("pointercancel", onPointerUp)
    target.addEventListener("pointerout", onPointerUp)

    // Prevent dragstart event since it conflicts with pointermove
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
    }
  }
}

export const useGesture = <T extends HTMLElement, DS, DM, PS, PM>(callbacks: {
  onDragStart?: (e: React.PointerEvent<T>) => DS | undefined,
  onDragMove?: (e: React.PointerEvent<T>, dragStartData: DS | undefined, prevDragMoveData: DM | undefined) => DM | undefined,
  onDragEnd?: (e: React.PointerEvent<T>, dragStartData: DS | undefined, prevDragMoveData: DM | undefined) => void,
  onPinchStart?: (events: [React.PointerEvent<T>, React.PointerEvent<T>], triggerEventIndex: number) => PS | undefined,
  onPinchMove?: (events: [React.PointerEvent<T>, React.PointerEvent<T>], triggerEventIndex: number, pinchStartData: PS | undefined, prevPinchMoveData: PM | undefined) => PM | undefined,
  onPinchEnd?: (events: [React.PointerEvent<T>, React.PointerEvent<T>], triggerEventIndex: number, pinchStartData: PS | undefined, prevPinchMoveData: PM | undefined) => void,
}) => {
  const eventsRef = useRef<(React.PointerEvent<T> | null)[]>([])
  const dragStartDataRef = useRef<DS>()
  const dragMoveDataRef = useRef<DM>()
  const pinchStartDataRef = useRef<PS>()
  const pinchMoveDataRef = useRef<PM>()

  const onPointerDown = (e: React.PointerEvent<T>) => {
    if (e.isPrimary) {
      if (eventsRef.current.some(e => e !== null)) {
        console.warn("Found not cleaned up events")
      }

      eventsRef.current = []
      dragStartDataRef.current = undefined
      dragMoveDataRef.current = undefined
      pinchStartDataRef.current = undefined
      pinchMoveDataRef.current = undefined
    }

    if (eventsRef.current.length >= 2) {
      return
    }

    const events = [...eventsRef.current, e]
    eventsRef.current = events

    e.currentTarget.setPointerCapture(e.pointerId)

    if (events.length === 1 && callbacks.onDragStart) {
      const data = callbacks.onDragStart(e)
      dragStartDataRef.current = data
    } else if (events.length === 2 && events[0] && events[1] && callbacks.onPinchStart) {
      const data = callbacks.onPinchStart([events[0], events[1]], 1)
      pinchStartDataRef.current = data
    }
  }

  const onPointerMove = (e: React.PointerEvent<T>) => {
    const events = [...eventsRef.current]
    const index = events.findIndex(ev => ev?.pointerId === e.pointerId)
    if (index !== -1) {
      events[index] = e
      eventsRef.current = events

      if (index === 0 && callbacks.onDragMove) {
        dragMoveDataRef.current = callbacks.onDragMove(e, dragStartDataRef.current, dragMoveDataRef.current)
      }

      if (events.length === 2 && events[0] && events[1] && callbacks.onPinchMove) {
        pinchMoveDataRef.current = callbacks.onPinchMove([events[0], events[1]], index, pinchStartDataRef.current, pinchMoveDataRef.current)
      }
    }
  }

  const onPointerUp = (e: React.PointerEvent<T>) => {
    const events = [...eventsRef.current]
    const index = events.findIndex(ev => ev?.pointerId === e.pointerId)
    if (index !== -1) {
      events[index] = e

      if (events.length === 2 && events[0] && events[1] && callbacks.onPinchEnd) {
        callbacks.onPinchEnd([events[0], events[1]], index, pinchStartDataRef.current, pinchMoveDataRef.current)
      }

      if (index === 0 && callbacks.onDragEnd) {
        callbacks.onDragEnd(e, dragStartDataRef.current, dragMoveDataRef.current)
      }

      e.currentTarget.releasePointerCapture(e.pointerId)

      events[index] = null
      eventsRef.current = events
    }
  }

  return {onPointerDown, onPointerMove, onPointerUp}
}

export const makeDragStartCallback = <T extends HTMLElement,>(
  onDragStart: (e: React.PointerEvent<T>) => {
    onDragging?: (e: PointerEvent) => void,
    onDragEnd?: (e: PointerEvent) => void,
  } | undefined,
) => useGesture1((e: React.PointerEvent<T>) => {
  const ret = onDragStart ? onDragStart(e) : undefined
  const { onDragging, onDragEnd } = ret ?? {}
  return {onDragMove: onDragging, onDragEnd}
})
