import React from 'react'
import './LoadingOverlay.css'

class LoadingOverlay extends React.Component {
  render (): JSX.Element {
    return (
      <div className='loadingOverlay'>
        <div className='loadingOverlay__text'>
          Loading...
        </div>
      </div>
    )
  }
}

export default LoadingOverlay
