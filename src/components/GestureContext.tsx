import React, { useRef, createContext, useContext } from "react";

type GestureContextValue = React.MutableRefObject<HTMLElement | null>;

const GestureContext = createContext<GestureContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

export function GestureContextProvider(props: Props) {
  const gestureLockRef = useRef<HTMLElement | null>(null);

  return <GestureContext.Provider value={gestureLockRef}>{props.children}</GestureContext.Provider>;
}

export const useGesture = <T extends HTMLElement, DS, DM, PS, PM>(config: {
  forceAcquireLockOnPinchStart?: boolean;
  onDragStart?: (e: React.PointerEvent<T>) => DS;
  onDragMove?: (e: React.PointerEvent<T>, dragStartData: DS, prevDragMoveData: DM | undefined) => DM;
  onDragEnd?: (e: React.PointerEvent<T>, dragStartData: DS, prevDragMoveData: DM | undefined) => void;
  onPinchStart?: (events: [React.PointerEvent<T>, React.PointerEvent<T>], triggerEventIndex: number) => PS;
  onPinchMove?: (
    events: [React.PointerEvent<T>, React.PointerEvent<T>],
    triggerEventIndex: number,
    pinchStartData: PS,
    prevPinchMoveData: PM | undefined,
  ) => PM;
  onPinchEnd?: (
    events: [React.PointerEvent<T>, React.PointerEvent<T>],
    triggerEventIndex: number,
    pinchStartData: PS,
    prevPinchMoveData: PM | undefined,
  ) => void;
}) => {
  const eventsRef = useRef<(React.PointerEvent<T> | null)[]>([]);
  const dragStartDataRef = useRef<{ data: DS }>();
  const dragMoveDataRef = useRef<{ data: DM }>();
  const pinchStartDataRef = useRef<{ data: PS }>();
  const pinchMoveDataRef = useRef<{ data: PM }>();

  const gestureLockRef = useContext(GestureContext);
  if (gestureLockRef === null) {
    throw new Error("Not in a gesture context");
  }

  const getActiveEvents = () => eventsRef.current.filter((e) => e !== null);

  const setPointerCapture = (target: T) => {
    getActiveEvents().forEach((e) => {
      if (!target.hasPointerCapture(e.pointerId)) {
        target.setPointerCapture(e.pointerId);
      }
    });
  };

  const onPointerDown = (e: React.PointerEvent<T>) => {
    // Remove all selection since it prevents pointermove events
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }

    if (e.isPrimary) {
      if (getActiveEvents().length > 0) {
        console.warn("Found not cleaned up events", eventsRef.current, e.currentTarget);
      }
      if (gestureLockRef.current && !gestureLockRef.current.hasPointerCapture(e.pointerId)) {
        console.warn("Found unreleased lock", gestureLockRef.current, e.currentTarget);
        gestureLockRef.current = null;
      }
      eventsRef.current = [];
      dragStartDataRef.current = undefined;
      dragMoveDataRef.current = undefined;
      pinchStartDataRef.current = undefined;
      pinchMoveDataRef.current = undefined;
    }

    if (getActiveEvents().length >= 2) {
      return;
    }

    eventsRef.current = [...eventsRef.current, e];

    if (gestureLockRef.current && gestureLockRef.current !== e.currentTarget) {
      // Already locked by one of descendant nodes

      const activeEvents = getActiveEvents();
      if (activeEvents.length === 2 && config.forceAcquireLockOnPinchStart) {
        const lock = gestureLockRef.current;
        activeEvents.forEach((e) => {
          if (lock.hasPointerCapture(e.pointerId)) {
            lock.releasePointerCapture(e.pointerId);
          }
        });
      } else {
        return;
      }
    }
    // Acquire lock
    gestureLockRef.current = e.currentTarget;

    setPointerCapture(e.currentTarget);

    if (eventsRef.current.length === 1) {
      // Start drag
      const data = config.onDragStart ? config.onDragStart(e) : (undefined as any);
      dragStartDataRef.current = { data };
    } else {
      const events = getActiveEvents();
      if (events.length === 2) {
        // Terminate drag before starting pinch
        if (config.onDragEnd) {
          if (!dragStartDataRef.current) {
            // dragStartData can be empty if acquires lock by forceAcquireLockOnPinchStart
          } else {
            config.onDragEnd(e, dragStartDataRef.current.data, dragMoveDataRef.current?.data);
          }
        }

        // Start pinch
        const data = config.onPinchStart ? config.onPinchStart([events[0], events[1]], 1) : (undefined as any);
        pinchStartDataRef.current = { data };
      }
    }
  };

  const onPointerMove = (e: React.PointerEvent<T>) => {
    const index = eventsRef.current.findIndex((ev) => ev?.pointerId === e.pointerId);
    if (index === -1) {
      return;
    }

    eventsRef.current[index] = e;

    if (gestureLockRef.current !== e.currentTarget) {
      return;
    }

    setPointerCapture(e.currentTarget);

    if (index === 0 && eventsRef.current.length === 1 && config.onDragMove) {
      // Handle event as DragMove
      if (!dragStartDataRef.current) {
        throw new Error("dragStartDataRef is not set");
      }
      const data = config.onDragMove(e, dragStartDataRef.current.data, dragMoveDataRef.current?.data);
      dragMoveDataRef.current = { data };
    }

    const events = getActiveEvents();
    if (events.length === 2 && config.onPinchMove) {
      // Handle event as PinchMove
      if (!pinchStartDataRef.current) {
        throw new Error("pinchStartDataRef is not set");
      }
      const index = events.findIndex((ev) => ev.pointerId === e.pointerId);
      const data = config.onPinchMove(
        [events[0], events[1]],
        index,
        pinchStartDataRef.current.data,
        pinchMoveDataRef.current?.data,
      );
      pinchMoveDataRef.current = { data };
    }
  };

  const onPointerUp = (e: React.PointerEvent<T>) => {
    const index = eventsRef.current.findIndex((ev) => ev?.pointerId === e.pointerId);
    if (index === -1) {
      return;
    }

    eventsRef.current[index] = e;

    if (gestureLockRef.current === e.currentTarget || e.type === "lostpointercapture") {
      if (index === 0 && eventsRef.current.length === 1 && config.onDragEnd) {
        // Handle event as DragEnd
        if (!dragStartDataRef.current) {
          throw new Error("dragStartDataRef is not set");
        }
        config.onDragEnd(e, dragStartDataRef.current.data, dragMoveDataRef.current?.data);
      }

      const events = getActiveEvents();
      if (events.length === 2 && config.onPinchEnd) {
        // Handle event as PinchEnd
        if (!pinchStartDataRef.current) {
          throw new Error("pinchStartDataRef is not set");
        }
        const index = events.findIndex((ev) => ev.pointerId === e.pointerId);
        config.onPinchEnd(
          [events[0], events[1]],
          index,
          pinchStartDataRef.current.data,
          pinchMoveDataRef.current?.data,
        );
      }

      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    }

    eventsRef.current[index] = null;

    if (gestureLockRef.current === e.currentTarget && getActiveEvents().length === 0) {
      // Release lock
      gestureLockRef.current = null;
    }
  };

  const onPointerCancel = onPointerUp;
  const onLostPointerCapture = (e: React.PointerEvent<T>) => {
    if (e.target === e.currentTarget) {
      onPointerUp(e);
    }
  };

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onLostPointerCapture };
};
