import React, { useRef, useState, createContext, useContext, useMemo } from 'react'
import { useGesture } from './GestureContext'
import { useProjectContext } from './ProjectContext'
import { Panel as PanelClass } from '../lib/panel'
import { useBoardContext } from './BoardContext'

type PanelContextValue = {
  panelId: string
  setPanelName: (name: string) => void
  setPanelPositionOffset: (position: [number, number]) => void
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
    updateProject({type: "activatePanel", panelId: props.panel.id})
  }

  const [panelName, setPanelName] = useState<string>("")

  const panelContextValue = useMemo(() => ({
    panelId: props.panel.id,
    setPanelName,
    setPanelPositionOffset,
  }), [props.panel.id])

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
        display: "inline-block",
        borderRadius: `${8 * zoom}px`,
        boxShadow: "2px 4px 16px 4px lightgray",
        background: "white",
      }}
    >
      <div
        {...draggableAreaGestureHandlers}
        style={{
          cursor: dragging ? "grabbing" : "grab",
          display: "flex",
          alignItems: "center",
          height: `${48 * zoom}px`,
          padding: `0 ${12 * zoom}px`,
          boxSizing: "border-box",
          userSelect: "none",
        }}
      >
        <span style={{fontSize: `${Math.max(zoom * 100, 25)}%`}}>{panelName}</span>
      </div>
      <div
        style={{
          padding: `0 ${12 * zoom}px ${12 * zoom}px`,
        }}
      >
        <PanelContext.Provider value={panelContextValue}>
          {props.children}
        </PanelContext.Provider>
      </div>
    </div>
  )
}
