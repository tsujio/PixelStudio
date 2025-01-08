import React from 'react'
import Button from 'tsx!component/Button'

type Props = {
  onSaveButtonClick: () => void
}

export default function NavigationBar(props: Props) {
  return <>
    <Button onClick={props.onSaveButtonClick}>Save</Button>
  </>
}
