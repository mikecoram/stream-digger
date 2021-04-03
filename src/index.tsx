import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './components/App'
import { LocalStorageSpotifySession } from './lib/local-storage-spotify-session'
import { LocalStorageSpotifyOAuth } from './lib/local-storage-spotify-oauth'

const urlParams = new URLSearchParams(window.location.search)
const state = urlParams.get('state')
const code = urlParams.get('code')

if (code !== null && state !== null) {
  const error = urlParams.get('error')

  if (error !== null) {
    throw new Error(error)
  }

  const oauth = new LocalStorageSpotifyOAuth()

  if (state === oauth.getLocalState()) {
    oauth.getToken(code).then(res => {
      const localSession = new LocalStorageSpotifySession()
      localSession.setFromTokenResponse(res)
      window.location.replace(`${window.location.pathname}`)
    }).catch(err => { throw err })
  }
} else {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  )
}
