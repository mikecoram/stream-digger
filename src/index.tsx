import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { LocalStorageSpotifyAuth } from './lib/local-storage-spotify-auth'
import { getItemsFromDropEvent } from './lib/spotify-drop-on-page'
import { DroppedSpotifyItem } from './lib/models/spotify-drop'
import { SpotifySession } from './lib/models/spotify-session'
import { LocalStorageDroppedSpotifyItems } from './lib/local-storage-dropped-spotify-items';

function render (
  items: DroppedSpotifyItem[],
  spotifySession: SpotifySession|null
): void {
  ReactDOM.render(
    <React.StrictMode>
      <App
      spotifySession={spotifySession}
      items={items} 
      />
    </React.StrictMode>,
    document.getElementById('root')
  )
}

const spotifyAuth = new LocalStorageSpotifyAuth()
const spotifySession = spotifyAuth.getSession()
const hashFragment = window.location.toString().split('#')[1]
const isSpotifyAuthCallback = hashFragment !== undefined

const storedItems = new LocalStorageDroppedSpotifyItems()

if (isSpotifyAuthCallback) {
  spotifyAuth.setSessionFromCallbackHashFragment(hashFragment)
  window.location.replace(`${window.location.pathname}`)
} else {
  render(storedItems.get(), spotifySession)
}

window.addEventListener('dragover', (e) => e.preventDefault())

window.addEventListener('drop', async (e) => {
  e.preventDefault()
  storedItems.append(await getItemsFromDropEvent(e))
  render(storedItems.get(), spotifySession)
})
