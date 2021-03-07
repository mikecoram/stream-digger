import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { LocalStorageSpotifyAuth } from './lib/local-storage-spotify-auth'
import { getItemsFromDropEvent } from './lib/spotify-drop-on-page'
import { DroppedSpotifyItem } from './lib/models/spotify-drop'
import { SpotifySession } from './lib/models/spotify-session'

function render (spotifySession: SpotifySession|null, droppedItems?: DroppedSpotifyItem[]): void {
  ReactDOM.render(
    <React.StrictMode>
      <App spotifySession={spotifySession} droppedItems={droppedItems} />
    </React.StrictMode>,
    document.getElementById('root')
  )
}

const spotifyAuth = new LocalStorageSpotifyAuth()
const spotifySession = spotifyAuth.getSession()
const hashFragment = window.location.toString().split('#')[1]
const isSpotifyAuthCallback = hashFragment !== undefined

if (isSpotifyAuthCallback) {
  spotifyAuth.setSessionFromCallbackHashFragment(hashFragment)
  window.location.replace(`${window.location.pathname}`)
} else {
  render(spotifySession)
}

window.addEventListener('dragover', (e) => e.preventDefault())

window.addEventListener('drop', async (e) => {
  e.preventDefault()
  render(spotifySession, await getItemsFromDropEvent(e))
})
