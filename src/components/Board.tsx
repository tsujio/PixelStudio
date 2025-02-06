import { useEffect, useRef, useState } from 'react'
import { useProjectContext } from './ProjectContext'
import { Panel } from "./Panel"
import { Drawing } from "./Drawing"
import { useGesture } from './GestureContext'
import { Panel as PanelClass, DrawingPanel } from '../lib/panel'
import { ToolBox } from './ToolBox'
import { MobileNavigation } from './MobileNavigation'
import { useBoardContext } from './BoardContext'
import { useWindowContext } from './WindowContext'
import { BoardControl } from './BoardControl'

type Props = {
  sidebarWidth: number | undefined
}

export const Board = (props: Props) => {
  const { project } = useProjectContext()
  const { boardNavigation, updateBoardNavigation } = useBoardContext()
  const { windowSize } = useWindowContext()

  const [lastProjectId, setLastProjectId] = useState<string | undefined>()
  useEffect(() => {
    // Set perspective to first panel position when new project loaded
    if (lastProjectId !== project.id && props.sidebarWidth !== undefined) {
      setLastProjectId(project.id)
      const panel = project.getActivePanel()
      if (panel) {
        const [xOffset, yOffset] = [-(props.sidebarWidth + 20) / boardNavigation.zoom, -60 / boardNavigation.zoom]
        const perspective: [number, number] = [panel.x + xOffset, panel.y + yOffset]
        updateBoardNavigation({type: "setPerspective", perspective})
      }
    }
  }, [lastProjectId, project, props.sidebarWidth, boardNavigation, updateBoardNavigation])

  const [dragging, setDragging] = useState(false)
  const gestureHandlers = useGesture({
    forceAcquireLockOnPinchStart: true,
    onDragStart: e => {
      if (e.target === e.currentTarget) {
        setDragging(true)
      }
      return [e.pageX, e.pageY] as [number, number]
    },
    onDragMove: (e, dragStartData, prevDragMoveData: [number, number] | undefined) => {
      if (dragging) {
        const [prevX, prevY] = prevDragMoveData ?? dragStartData
        const [diffX, diffY] = [e.pageX - prevX, e.pageY - prevY]
        updateBoardNavigation({type: "setPerspective", perspective: [
          boardNavigation.perspective[0] - diffX / boardNavigation.zoom,
          boardNavigation.perspective[1] - diffY / boardNavigation.zoom,
        ]})
      }
      return [e.pageX, e.pageY] as [number, number]
    },
    onDragEnd: () => {
      setDragging(false)
    },
    onPinchStart: ([e1, e2]) => {
      return {
        zoom: boardNavigation.zoom,
        basePoint: [(e1.pageX + e2.pageX) / 2, (e1.pageY + e2.pageY) / 2] as [number, number],
        distance: Math.sqrt(Math.pow(e1.pageX - e2.pageX, 2) + Math.pow(e1.pageY - e2.pageY, 2)),
      }
    },
    onPinchMove: ([e1, e2], _, pinchStartData) => {
      const distance = Math.sqrt(Math.pow(e1.pageX - e2.pageX, 2) + Math.pow(e1.pageY - e2.pageY, 2))
      const ratio = distance / pinchStartData.distance
      const zoom = pinchStartData.zoom * ratio
      updateBoardNavigation({type: "setZoom", zoom, basePoint: pinchStartData.basePoint})
    },
  })

  const pointerPositionRef = useRef<[number, number]>([0, 0])
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      pointerPositionRef.current = [e.pageX, e.pageY]
    }
    document.addEventListener("pointermove", onPointerMove)
    return () => {
      document.removeEventListener("pointermove", onPointerMove)
    }
  }, [])

  useEffect(() => {
    const onKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "Semicolon") {
        e.preventDefault()
        updateBoardNavigation({type: "setZoom", zoom: boardNavigation.zoom + 0.1, basePoint: pointerPositionRef.current})
      }

      if (e.ctrlKey && e.code === "Minus") {
        e.preventDefault()
        updateBoardNavigation({type: "setZoom", zoom: boardNavigation.zoom - 0.1, basePoint: pointerPositionRef.current})
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [boardNavigation.zoom])

  const [toolBoxOpen, setToolBoxOpen] = useState(windowSize.type !== "mobile")

  const [panelRefs, setPanelRefs] = useState<{panel: PanelClass, ref: React.RefObject<HTMLElement>}[]>([])
  const onPanelMountChange = (panel: PanelClass, ref: React.RefObject<HTMLElement> | null) => {
    setPanelRefs(panelRefs => {
      if (ref && panelRefs.every(p => p.panel.id !== panel.id)) {
        return [...panelRefs, {panel, ref}]
      } else if (!ref) {
        return panelRefs.filter(p => p.panel.id !== panel.id)
      } else {
        return panelRefs
      }
    })
  }

  return (
    <>
      <div
        {...gestureHandlers}
        style={{
          position: "relative",
          height: "100%",
          overflow: "hidden",
          backgroundSize: `${42 * boardNavigation.zoom}px ${42 * boardNavigation.zoom}px`,
          backgroundImage: `radial-gradient(circle, gray ${1 * boardNavigation.zoom}px, transparent ${1 * boardNavigation.zoom}px)`,
          backgroundPositionX:  -boardNavigation.perspective[0] * boardNavigation.zoom + "px",
          backgroundPositionY:  -boardNavigation.perspective[1] * boardNavigation.zoom + "px",
          cursor: dragging ? "grabbing" : "inherit",
        }}
      >
        {project.panels.map((panel, i) =>
          <Panel
            key={panel.id}
            panel={panel}
            top={(panel.y - boardNavigation.perspective[1]) * boardNavigation.zoom}
            left={(panel.x - boardNavigation.perspective[0]) * boardNavigation.zoom}
            zIndex={i + 1}
            onMountChange={onPanelMountChange}
            panelRefs={panelRefs}
          >
            {panel instanceof DrawingPanel &&
            <Drawing
              drawing={project.getDrawing(panel.drawingId)}
            />}
          </Panel>
        )}
      </div>
      <BoardControl toolBoxOpen={toolBoxOpen} openToolBox={() => setToolBoxOpen(true)} />
      <ToolBox open={toolBoxOpen} onClose={() => setToolBoxOpen(false)} />
      <MobileNavigation />
    </>
  )
}
