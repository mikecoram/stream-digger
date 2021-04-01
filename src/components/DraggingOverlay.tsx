import React from 'react'
import './DraggingOverlay.css'

class DraggingOverlay extends React.Component {
  render (): JSX.Element {
    return (
      <div className='draggingOverlay'>
        <div className='draggingOverlay__text'>
          Drop your Spotify links anywhere on the page to add
        </div>
      </div>
    )
  }
}

export default DraggingOverlay
