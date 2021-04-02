import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './components/App'
import { LocalStorageSpotifyAuth } from './lib/local-storage-spotify-auth'
import { getToken } from './lib/spotify-auth'

const urlParams = new URLSearchParams(window.location.search)
const state = urlParams.get('state')
const code = urlParams.get('code')
const isSpotifyAuthCallback = code !== null && state !== null

if (isSpotifyAuthCallback) {
  const error = urlParams.get('error')

  if (error) {
    throw error
  }

  if (state === localStorage.getItem("pkce_state")) {
    getToken(code ?? '').then(res => {
      const spotifyAuth = new LocalStorageSpotifyAuth()
      spotifyAuth.setSessionFromTokenResponse(res)
      window.location.replace(`${window.location.pathname}`)
    })
  }
} else {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  )
}
