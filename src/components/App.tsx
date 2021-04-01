import React from 'react'
import './App.css'
import ReleasesTable from './releases-table/ReleasesTable'
import { merchants } from '../lib/merchants'
import ClearAllBtn from './ClearAllBtn'
import DragPrompt from './DragPrompt'
import LogoutBtn from './LogoutBtn'
import Header from './Header'
import Footer from './Footer'
import { Login } from './Login'
import DragoverPrompt from './DragoverPrompt'
import { Album } from '../lib/models/album'
import { getItemsFromDroppedURIs, getPlainTextURIsFromDropEventData, onlySpotifyURIs } from '../lib/spotify-drop-on-page'
import { LocalStorageSpotifyAuth } from '../lib/local-storage-spotify-auth'
import { LocalStorageDroppedSpotifyItems } from '../lib/local-storage-dropped-spotify-items'
import { DroppedSpotifyItem } from '../lib/models/spotify-drop'
import SpotifyWebApi from 'spotify-web-api-js'
import { droppedItemsToAlbums } from '../lib/spotify-resolve-dropped-items'
import { SpotifyResolver } from '../lib/spotify-resolver'

const spotifyAuth = new LocalStorageSpotifyAuth()
const storedItems = new LocalStorageDroppedSpotifyItems()

interface State {
  albums: Album[]
  isDragging: boolean
  isLoggedIn: boolean
}

const getAlbums = async (
  accessToken: string,
  items: DroppedSpotifyItem[],
): Promise<Album[]> => {
  const api = new SpotifyWebApi()
  api.setAccessToken(accessToken)
  const spotify = new SpotifyResolver(api)
  return await droppedItemsToAlbums(spotify, items)
}

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props)
    const session = spotifyAuth.getSession()

    this.state = {
      albums: [],
      isDragging: false,
      isLoggedIn: session !== undefined && !session.isExpired,
    }
  }

  async componentDidMount() {
    window.addEventListener('drop', async (e) => {
      e.preventDefault()
      const session = spotifyAuth.getSession()

      if (session === undefined || session.isExpired) {
        return
      }

      if (e.dataTransfer === null) {
        return
      }

      const spotifyURIs = onlySpotifyURIs(
        await getPlainTextURIsFromDropEventData(e.dataTransfer)
      )

      if (spotifyURIs.length !== 0) {
        storedItems.append(getItemsFromDroppedURIs(spotifyURIs))
        const albums = await getAlbums(session.accessToken, storedItems.get())
        return this.setState({ albums, isDragging: false })
      }

      this.setState({ isDragging: false })
    })

    window.addEventListener('dragover', (e) => {
      e.preventDefault()
      this.setState({ isDragging: true })
    })

    window.addEventListener('dragenter', (e) => {
      e.preventDefault()
      this.setState({ isDragging: true })
    })

    window.addEventListener('dragleave', (e) => {
      e.preventDefault()
      this.setState({ isDragging: false })
    })

    const session = spotifyAuth.getSession()

    if (session === undefined || session.isExpired) {
      return
    }

    const albums = await getAlbums(session.accessToken, storedItems.get())
    this.setState({ albums })
  }

  componentWillUnmount() {
    return true
  }

  onClearItems() {
    if (window.confirm('Are you sure you want to clear all items?')) {
      storedItems.clear()
      this.setState({ albums: [] })
    }
  }

  onLogout() {
    if (window.confirm('Are you sure you want to logout?')) {
      spotifyAuth.clearSession()
      this.setState({ albums: [], isLoggedIn: false })
    }
  }

  buttons (showClearAll: boolean): JSX.Element {
    return (
      <div className='buttonContainer'>
        {
          showClearAll
            ? <ClearAllBtn onClearItems={() => this.onClearItems()} />
            : null
        }
        <LogoutBtn onLogout={() => this.onLogout()} />
      </div>
    )
  }

  content (): JSX.Element {
    const { albums, isDragging, isLoggedIn } = this.state

    if (!isLoggedIn) {
      return <Login />
    }

    if (isDragging) {
      return <DragoverPrompt />
    }

    if (albums.length === 0) {
      return <DragPrompt />
    }

    return <ReleasesTable albums={albums} merchants={merchants} />
  }

  render (): JSX.Element {
    const { albums } = this.state

    return (
      <div className='app'>
        <Header buttons={this.buttons(albums.length > 0)} />
        <div className='content'>
          {this.content()}
        </div>
        <Footer />
      </div>
    )
  }
}

export default App
