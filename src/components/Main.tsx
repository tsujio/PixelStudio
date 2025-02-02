import { Sidebar, SidebarState } from './Sidebar'
import { Board } from './Board'
import { useWindowContext } from './WindowContext'
import { useState } from 'react'

export function Main() {
  const { windowSize } = useWindowContext()

  const [sidebarState, setSidebarState] = useState<SidebarState>({open: windowSize.type !== "mobile", width: undefined})

  return (
    <>
      <Sidebar state={sidebarState} onStateChange={setSidebarState} />
      <Board sidebarWidth={sidebarState.open ? sidebarState.width : 0} />
    </>
  )
}
