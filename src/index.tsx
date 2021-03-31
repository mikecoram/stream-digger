import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './components/App'
import { LocalStorageSpotifyAuth } from './lib/local-storage-spotify-auth'
import { getItemsFromDropEvent } from './lib/spotify-drop-on-page'
import { LocalStorageDroppedSpotifyItems } from './lib/local-storage-dropped-spotify-items'
import { DroppedSpotifyItem } from './lib/models/spotify-drop'
import SpotifyWebApi from 'spotify-web-api-js'
import { SpotifyResolver } from './lib/spotify-resolver'
import { droppedItemsToAlbums } from './lib/spotify-resolve-dropped-items'

const spotifyAuth = new LocalStorageSpotifyAuth()
const storedItems = new LocalStorageDroppedSpotifyItems()

const getAlbums = async (
  accessToken: string,
  items: DroppedSpotifyItem[],
): Promise<SpotifyApi.AlbumObjectFull[]> => {
  const api = new SpotifyWebApi()
  api.setAccessToken(accessToken)
  const spotify = new SpotifyResolver(api)
  return await droppedItemsToAlbums(spotify, items)
}

const render = async ({ isDragging = false } = {}) => {
  const session = spotifyAuth.getSession()
  let albums: SpotifyApi.AlbumObjectFull[] = []

  if (session !== undefined) {
    albums = await getAlbums(
      session.accessToken,
      storedItems.get()
    )
  }

  ReactDOM.render(
    <React.StrictMode>
      <App 
        albums={albums}
        isLoggedIn={session !== undefined}
        isDragging={isDragging}
        onClearItems={clear}
        onLogout={logout}
      />
    </React.StrictMode>,
    document.getElementById('root')
  )
}

const logout = (): void => {
  if (window.confirm('Are you sure you want to logout?')) {
    spotifyAuth.clearSession()
    render()
  }
}

const clear = (): void => {
  if (window.confirm('Are you sure you want to clear all items?')) {
    storedItems.clear()
    render()
  }
}

const renderWithDroppedItems = async (e: DragEvent): Promise<void> => {
  storedItems.append(await getItemsFromDropEvent(e))
  render()
}

window.addEventListener('drop', (e) => {
  e.preventDefault()

  if (spotifyAuth.getSession() === undefined || spotifyAuth.getSession()?.isExpired) {
    return
  }

  void renderWithDroppedItems(e)
})

window.addEventListener('dragover', (e) => {
  e.preventDefault()
  render({ isDragging: true })
})

window.addEventListener('dragenter', (e) => {
  e.preventDefault()
  render({ isDragging: true })
})

window.addEventListener('dragleave', (e) => {
  e.preventDefault()
  render()
})

const pageLoad = async (): Promise<void> => {
  const hashFragment = window.location.toString().split('#')[1]
  const isSpotifyAuthCallback = hashFragment !== undefined

  if (isSpotifyAuthCallback) {
    spotifyAuth.setSessionFromCallbackHashFragment(hashFragment)
    return window.location.replace(`${window.location.pathname}`)
  }

  render()
}

void pageLoad()
