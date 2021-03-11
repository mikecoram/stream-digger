import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { LocalStorageSpotifyAuth } from './lib/local-storage-spotify-auth'
import { getItemsFromDropEvent } from './lib/spotify-drop-on-page'
import { LocalStorageDroppedSpotifyItems } from './lib/local-storage-dropped-spotify-items';
import SpotifyWebApi from 'spotify-web-api-js'
import { resolveDroppedItems } from './lib/spotify-resolve-dropped-items';

function render (
  items: SpotifyApi.AlbumObjectFull[],
  isLoggedIn: boolean
): void {
  ReactDOM.render(
    <React.StrictMode>
      <App
      isLoggedIn={isLoggedIn}
      albums={items} 
      />
    </React.StrictMode>,
    document.getElementById('root')
  )
}

const spotifyAuth = new LocalStorageSpotifyAuth()
const spotifySession = spotifyAuth.getSession()
const isLoggedIn = spotifySession !== null && !spotifySession?.isExpired
const storedItems = new LocalStorageDroppedSpotifyItems()
const api = new SpotifyWebApi()
api.setAccessToken(spotifySession?.accessToken as string)

window.addEventListener('dragover', (e) => e.preventDefault())

window.addEventListener('drop', async (e) => {
  e.preventDefault()
  storedItems.append(await getItemsFromDropEvent(e))
  const items = await resolveDroppedItems(api, storedItems.get())
  render(items, isLoggedIn)
})

// page load
;(async () => {
  const hashFragment = window.location.toString().split('#')[1]
  const isSpotifyAuthCallback = hashFragment !== undefined

  if (isSpotifyAuthCallback) {
    spotifyAuth.setSessionFromCallbackHashFragment(hashFragment)
    window.location.replace(`${window.location.pathname}`)
  }

  let items: SpotifyApi.AlbumObjectFull[] = []
  
  if (isLoggedIn) {
    items = await resolveDroppedItems(api, storedItems.get())
  }

  render(items, isLoggedIn)
})()
