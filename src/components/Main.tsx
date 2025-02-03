import { Sidebar, SidebarState } from './Sidebar'
import { Board } from './Board'
import { useWindowContext } from './WindowContext'
import { useEffect, useState } from 'react'
import { useProjectContext } from './ProjectContext'

export function Main() {
  const { projectHistory } = useProjectContext()
  const { windowSize } = useWindowContext()

  const [sidebarState, setSidebarState] = useState<SidebarState>({open: windowSize.type !== "mobile", width: undefined})

  const clean = projectHistory.history[projectHistory.current].clean
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!clean) {
        e.preventDefault()
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => {
      window.removeEventListener("beforeunload", handler)
    }
  }, [clean])

  return (
    <>
      <Sidebar state={sidebarState} onStateChange={setSidebarState} />
      <Board sidebarWidth={sidebarState.open ? sidebarState.width : 0} />
    </>
  )
}
