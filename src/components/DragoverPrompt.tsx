import React from 'react'
import './DragoverPrompt.css'

class DragoverPrompt extends React.Component<{}> {
  render (): JSX.Element {
    return (
      <div className='dragoverPrompt'>
        <div className='dragoverPrompt__text'>
          Drop your Spotify links here
        </div>
      </div>
    )
  }
}

export default DragoverPrompt
