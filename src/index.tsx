import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './components/App'
import { LocalStorageSpotifyAuth } from './lib/local-storage-spotify-auth'

const render = (): void => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  )
}

const pageLoad = (): void => {
  const hashFragment = window.location.toString().split('#')[1]
  const isSpotifyAuthCallback = hashFragment !== undefined

  if (isSpotifyAuthCallback) {
    const spotifyAuth = new LocalStorageSpotifyAuth()
    spotifyAuth.setSessionFromCallbackHashFragment(hashFragment)
    return window.location.replace(`${window.location.pathname}`)
  }

  render()
}

pageLoad()
