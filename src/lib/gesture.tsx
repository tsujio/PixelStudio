import { useRef } from "react"

export const useGesture = <T extends HTMLElement, DS, DM, PS, PM>(callbacks: {
  onDragStart?: (e: React.PointerEvent<T>) => DS,
  onDragMove?: (e: React.PointerEvent<T>, dragStartData: DS, prevDragMoveData: DM | undefined) => DM,
  onDragEnd?: (e: React.PointerEvent<T>, dragStartData: DS, prevDragMoveData: DM | undefined) => void,
  onPinchStart?: (events: [React.PointerEvent<T>, React.PointerEvent<T>], triggerEventIndex: number) => PS,
  onPinchMove?: (events: [React.PointerEvent<T>, React.PointerEvent<T>], triggerEventIndex: number, pinchStartData: PS, prevPinchMoveData: PM | undefined) => PM,
  onPinchEnd?: (events: [React.PointerEvent<T>, React.PointerEvent<T>], triggerEventIndex: number, pinchStartData: PS, prevPinchMoveData: PM | undefined) => void,
}) => {
  const eventsRef = useRef<(React.PointerEvent<T> | null)[]>([])
  const dragStartDataRef = useRef<{data: DS}>()
  const dragMoveDataRef = useRef<{data: DM}>()
  const pinchStartDataRef = useRef<{data: PS}>()
  const pinchMoveDataRef = useRef<{data: PM}>()

  const getActiveEvents = () => eventsRef.current.filter(e => e !== null)

  const setPointerCapture = (target: T) => {
    getActiveEvents().forEach(e => {
      if (!target.hasPointerCapture(e.pointerId)) {
        target.setPointerCapture(e.pointerId)
      }
    })
  }

  const onPointerDown = (e: React.PointerEvent<T>) => {
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
    }

    if (e.isPrimary) {
      if (getActiveEvents().length > 0) {
        console.warn("Found not cleaned up events")
      }

      eventsRef.current = []
      dragStartDataRef.current = undefined
      dragMoveDataRef.current = undefined
      pinchStartDataRef.current = undefined
      pinchMoveDataRef.current = undefined
    }

    if (getActiveEvents().length >= 2) {
      return
    }

    const events = [...eventsRef.current, e]
    eventsRef.current = events

    setPointerCapture(e.currentTarget)

    if (events.length === 1 && callbacks.onDragStart) {
      const data = callbacks.onDragStart(e)
      dragStartDataRef.current = {data}
    } else {
      const events = getActiveEvents()
      if (events.length === 2 && callbacks.onPinchStart) {
        const data = callbacks.onPinchStart([events[0], events[1]], 1)
        pinchStartDataRef.current = {data}
      }
    }
  }

  const onPointerMove = (e: React.PointerEvent<T>) => {
    const index = eventsRef.current.findIndex(ev => ev?.pointerId === e.pointerId)
    if (index !== -1) {
      eventsRef.current[index] = e

      setPointerCapture(e.currentTarget)

      if (index === 0 && callbacks.onDragMove) {
        if (!dragStartDataRef.current) {
          throw new Error("dragStartDataRef is not set")
        }
        const data = callbacks.onDragMove(e, dragStartDataRef.current.data, dragMoveDataRef.current?.data)
        dragMoveDataRef.current = {data}
      }

      const events = getActiveEvents()
      if (events.length === 2 && callbacks.onPinchMove) {
        if (!pinchStartDataRef.current) {
          throw new Error("pinchStartDataRef is not set")
        }
        const index = events.findIndex(ev => ev.pointerId === e.pointerId)
        const data = callbacks.onPinchMove([events[0], events[1]], index, pinchStartDataRef.current.data, pinchMoveDataRef.current?.data)
        pinchMoveDataRef.current = {data}
      }
    }
  }

  const onPointerUp = (e: React.PointerEvent<T>) => {
    const index = eventsRef.current.findIndex(ev => ev?.pointerId === e.pointerId)
    if (index !== -1) {
      eventsRef.current[index] = e

      const events = getActiveEvents()
      if (events.length === 2 && callbacks.onPinchEnd) {
        if (!pinchStartDataRef.current) {
          throw new Error("pinchStartDataRef is not set")
        }
        const index = events.findIndex(ev => ev.pointerId === e.pointerId)
        callbacks.onPinchEnd([events[0], events[1]], index, pinchStartDataRef.current.data, pinchMoveDataRef.current?.data)
      }

      if (index === 0 && callbacks.onDragEnd) {
        if (!dragStartDataRef.current) {
          throw new Error("dragStartDataRef is not set")
        }
        callbacks.onDragEnd(e, dragStartDataRef.current.data, dragMoveDataRef.current?.data)
      }

      e.currentTarget.releasePointerCapture(e.pointerId)

      eventsRef.current[index] = null
    }
  }

  const onPointerCancel = onPointerUp
  const onLostPointerCapture = onPointerUp

  return {onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture}
}
