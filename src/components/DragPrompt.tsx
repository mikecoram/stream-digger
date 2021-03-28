import React from 'react'
import './DragPrompt.css'

class DragPrompt extends React.Component<{}> {
  render (): JSX.Element {
    return (
      <div className="dragPrompt">
        Drag a playlist, track, album or artist from Spotify to start...
      </div>
    )
  }
}

export default DragPrompt
