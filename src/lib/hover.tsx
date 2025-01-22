import { useCallback, useMemo, useState } from "react"

type UseHover = [
  boolean,
  {
    onMouseEnter: React.MouseEventHandler
    onMouseLeave: React.MouseEventHandler
  }
]

export const useHover = (): UseHover => {
  const [hover, setHover] = useState(false)

  const onMouseEnter = useCallback(() => {
    setHover(true)
  }, [])

  const onMouseLeave = useCallback(() => {
    setHover(false)
  }, [])

  const ret = useMemo(() => [
    hover,
    {
      onMouseEnter,
      onMouseLeave,
    }
  ], [hover, onMouseEnter, onMouseLeave])

  return ret as UseHover
}
