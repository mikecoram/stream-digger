import React from 'react'
import ReactDOM from 'react-dom'
import SpotifyWebApi from 'spotify-web-api-js'
import './index.css'
import App from './App'
import { LocalStorageSpotifyAuth } from './lib/local-storage-spotify-auth'
import { getItemsFromDropEvent } from './lib/spotify-drop-on-page'
import { LocalStorageDroppedSpotifyItems } from './lib/local-storage-dropped-spotify-items'
import { resolveDroppedItems } from './lib/spotify-resolve-dropped-items'

const spotifyAuth = new LocalStorageSpotifyAuth()
const storedItems = new LocalStorageDroppedSpotifyItems()

const render = (
  items: SpotifyApi.AlbumObjectFull[],
  isLoggedIn: boolean
) =>
  ReactDOM.render(
    <React.StrictMode>
      <App
        isLoggedIn={isLoggedIn}
        albums={items}
      />
    </React.StrictMode>,
    document.getElementById('root')
  )

const getAlbums = async (accessToken: string): Promise<SpotifyApi.AlbumObjectFull[]> => {
  const api = new SpotifyWebApi()
  api.setAccessToken(accessToken)
  return await resolveDroppedItems(api, storedItems.get())
}

const pageLoad = async (): Promise<void> => {
  const hashFragment = window.location.toString().split('#')[1]
  const isSpotifyAuthCallback = hashFragment !== undefined

  if (isSpotifyAuthCallback) {
    spotifyAuth.setSessionFromCallbackHashFragment(hashFragment)
    window.location.replace(`${window.location.pathname}`)
    return
  }

  let albums: SpotifyApi.AlbumObjectFull[] = []
  const spotifySession = spotifyAuth.getSession()

  if (spotifySession?.accessToken) {
    albums = await getAlbums(spotifySession.accessToken)
  }

  const isLoggedIn = spotifySession !== null && !spotifySession?.isExpired
  render(albums, isLoggedIn)
}

const renderWithDroppedItems = async (e: DragEvent, accessToken: string): Promise<void> => {
  storedItems.append(await getItemsFromDropEvent(e))
  render(await getAlbums(accessToken), true)
}

window.addEventListener('drop', (e) => {
  e.preventDefault()
  const spotifySession = spotifyAuth.getSession()

  if (spotifySession?.accessToken) {
    void renderWithDroppedItems(e, spotifySession.accessToken)
  }
})

window.addEventListener('dragover', (e) => e.preventDefault())

void pageLoad()
