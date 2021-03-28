import React from 'react'
import ReactDOM from 'react-dom'
import SpotifyWebApi from 'spotify-web-api-js'
import './index.css'
import App from './components/App'
import { Login } from './components/Login'
import { LocalStorageSpotifyAuth } from './lib/local-storage-spotify-auth'
import { getItemsFromDropEvent } from './lib/spotify-drop-on-page'
import { LocalStorageDroppedSpotifyItems } from './lib/local-storage-dropped-spotify-items'
import { droppedItemsToAlbums } from './lib/spotify-resolve-dropped-items'
import { SpotifyResolver } from './lib/spotify-resolver';
import DragoverPrompt from './components/DragoverPrompt'

const spotifyAuth = new LocalStorageSpotifyAuth()
const storedItems = new LocalStorageDroppedSpotifyItems()

const render = (
  element: React.FunctionComponentElement<any>,
) => ReactDOM.render(
  <React.StrictMode>
    {element}
  </React.StrictMode>,
  document.getElementById('root')
)

const logout = (): void => {
  if (window.confirm('Are you sure you want to logout?')) {
    spotifyAuth.clearSession()
    render(<Login />)
  }
}

const clear = (): void => {
  if (window.confirm('Are you sure you want to clear all items?')) {
    storedItems.clear()
    render(<App albums={[]} onClearItems={clear} onLogout={logout} />)
  }
}

const getAlbums = async (accessToken: string): Promise<SpotifyApi.AlbumObjectFull[]> => {
  const api = new SpotifyWebApi()
  api.setAccessToken(accessToken)
  const spotify = new SpotifyResolver(api)
  return await droppedItemsToAlbums(spotify, storedItems.get())
}

const pageLoad = async (): Promise<void> => {
  const hashFragment = window.location.toString().split('#')[1]
  const isSpotifyAuthCallback = hashFragment !== undefined

  if (isSpotifyAuthCallback) {
    spotifyAuth.setSessionFromCallbackHashFragment(hashFragment)
    return window.location.replace(`${window.location.pathname}`)
  }

  const spotifySession = spotifyAuth.getSession()

  if (spotifySession === null || spotifySession.isExpired) {
    return render(<Login />)
  }
 
  const albums = await getAlbums(spotifySession.accessToken)
  render(<App albums={albums} onClearItems={clear} onLogout={logout} />)
}

const renderWithDroppedItems = async (e: DragEvent, accessToken: string): Promise<void> => {
  storedItems.append(await getItemsFromDropEvent(e))
  const albums = await getAlbums(accessToken)
  render(<App albums={albums} onClearItems={clear} onLogout={logout} />)
}

window.addEventListener('drop', (e) => {
  e.preventDefault()
  const spotifySession = spotifyAuth.getSession()

  if (spotifySession?.accessToken) {
    void renderWithDroppedItems(e, spotifySession.accessToken)
  }
})

window.addEventListener('dragover', (e) => {
  e.preventDefault()
  render(<DragoverPrompt />)
})

window.addEventListener('dragenter', (e) => {
  e.preventDefault()
  render(<DragoverPrompt />)
})

window.addEventListener('dragleave', (e) => {
  e.preventDefault()
  void pageLoad()
})

void pageLoad()
