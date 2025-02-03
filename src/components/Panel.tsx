import React, { useRef, useState, createContext, useContext, useMemo } from 'react'
import { useGesture } from './GestureContext'
import { useProjectContext } from './ProjectContext'
import { Panel as PanelClass } from '../lib/panel'
import { useBoardContext } from './BoardContext'
import { ResizableArea, ResizeEvent } from './ResizableArea'

type PanelContextValue = {
  panelId: string
  setPanelName: (name: string) => void
  setPanelPositionOffset: (position: [number, number]) => void
  resize: ResizeEvent | undefined
}

const PanelContext = createContext<PanelContextValue | null>(null)

export function usePanelContext() {
  const value = useContext(PanelContext)
  if (value === null) {
    throw new Error("Not in a panel context")
  }
  return value
}

type Props = {
  panel: PanelClass
  top: number
  left: number
  zIndex?: number
  children: React.ReactNode
}

export function Panel(props: Props) {
  const { updateProject } = useProjectContext()
  const { boardNavigation } = useBoardContext()

  const panelRef = useRef<HTMLDivElement>(null)

  const [dragging, setDragging] = useState<boolean>(false)

  const [panelPositionOffset, setPanelPositionOffset] = useState<[number, number]>([0, 0])

  const draggableAreaGestureHandlers = useGesture({
    onDragStart: e => {
      setDragging(true)
      return [e.pageX, e.pageY] as [number, number]
    },
    onDragMove: (e, dragStartData) => {
      const [diffX, diffY] = [e.pageX - dragStartData[0], e.pageY - dragStartData[1]]
      setPanelPositionOffset([diffX, diffY])
    },
    onDragEnd: (e, dragStartData) => {
      const [diffX, diffY] = [e.pageX - dragStartData[0], e.pageY - dragStartData[1]]
      updateProject({type: "movePanel", panelId: props.panel.id, x: props.panel.x + diffX / boardNavigation.zoom, y: props.panel.y + diffY / boardNavigation.zoom})
      setPanelPositionOffset([0, 0])
      setDragging(false)
    },
  })

  const onPointerDown = () => {
    updateProject({type: "setPanelZ", panelId: props.panel.id, offset: Infinity})
  }

  const [resize, setResize] = useState<ResizeEvent | undefined>()
  const onResize = (e: ResizeEvent) => {
    if (!resize || resize.diff.top !== e.diff.top || resize.diff.left !== e.diff.left || resize.diff.bottom !== e.diff.bottom || resize.diff.right !== e.diff.right || resize.fix !== e.fix) {
      setResize(e)
    }
  }

  const [panelName, setPanelName] = useState<string>("")

  const panelContextValue = useMemo(() => ({
    panelId: props.panel.id,
    setPanelName,
    setPanelPositionOffset,
    resize,
  }), [props.panel.id, resize])

  const zoom = boardNavigation.zoom

  return (
    <div
      ref={panelRef}
      onPointerDown={onPointerDown}
      style={{
        position: "absolute",
        top: props.top + panelPositionOffset[1],
        left: props.left + panelPositionOffset[0],
        zIndex: props.zIndex,
        display: "block",
        borderRadius: `${8 * zoom}px`,
        boxShadow: "2px 4px 16px 4px lightgray",
        background: "white",
      }}
    >
      <ResizableArea onResize={onResize} draggableAreaSpan={12 * zoom}>
        <div
          {...draggableAreaGestureHandlers}
          style={{
            cursor: dragging ? "grabbing" : "grab",
            display: "flex",
            alignItems: "center",
            height: `${44 * zoom}px`,
            paddingLeft: `${4 * zoom}px`,
            boxSizing: "border-box",
            userSelect: "none",
          }}
        >
          <span style={{fontSize: `${Math.max(zoom * 100, 25)}%`}}>{panelName}</span>
        </div>
        <div>
          <PanelContext.Provider value={panelContextValue}>
            {props.children}
          </PanelContext.Provider>
        </div>
      </ResizableArea>
    </div>
  )
}
