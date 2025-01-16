import { useEffect, useRef } from "react"

type Props = {
  value: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  focusOnMount?: boolean
  blurOnEnter?: boolean
}

export function TextField(props: Props) {
  const ref = useRef<HTMLInputElement>(null)

  const onMountRef = useRef(true)
  const focus = props.focusOnMount && onMountRef.current
  if (onMountRef.current) {
    onMountRef.current = false
  }

  useEffect(() => {
    if (focus && ref.current !== null) {
      ref.current.focus()
    }
  }, [focus])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (props.blurOnEnter && !e.nativeEvent.isComposing && e.key === "Enter" && ref.current) {
      ref.current.blur()
    }
  }

  return (
    <input
      ref={ref}
      type="text"
      value={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
      onKeyDown={onKeyDown}
      style={{}}
    />
  )
}
