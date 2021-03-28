import React from 'react'
import './DragPrompt.css'

class DragPrompt extends React.Component<{}> {
  render (): JSX.Element {
    return (
      <div className="dragPrompt">
        Drag tracks, playlists, albums or artists from Spotify to here to start...
      </div>
    )
  }
}

export default DragPrompt
