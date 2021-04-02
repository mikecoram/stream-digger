import React from 'react'
import './App.css'
import { Album } from '../lib/models/album'
import { droppedItemsToAlbumIds, albumsIdsToAlbums } from '../lib/spotify-resolve-dropped-items';
import { getItemsFromDroppedURIs, getPlainTextURIsFromDropEventData, onlySpotifyURIs } from '../lib/spotify-drop-on-page'
import { LocalStorageDroppedSpotifyItems } from '../lib/local-storage-dropped-spotify-items'
import { LocalStorageSpotifyAuth } from '../lib/local-storage-spotify-auth'
import { Login } from './Login'
import { merchants } from '../lib/merchants'
import { SpotifyResolver } from '../lib/spotify-resolver'
import { SpotifySession } from '../lib/models/spotify-session'
import ClearAllBtn from './ClearAllBtn'
import DraggingOverlay from './DraggingOverlay'
import DragPrompt from './DragPrompt'
import Footer from './Footer'
import Header from './Header'
import LoadingOverlay from './LoadingOverlay'
import LogoutBtn from './LogoutBtn'
import ReleasesTable from './releases-table/ReleasesTable'
import SpotifyWebApi from 'spotify-web-api-js'
import { LocalStorageAlbums } from '../lib/local-storage-albums';

const spotifyAuth = new LocalStorageSpotifyAuth()
const storedItems = new LocalStorageDroppedSpotifyItems()
const localAlbums = new LocalStorageAlbums()

interface State {
  albums: Album[]
  isDragging: boolean
  isLoading: boolean
  isLoggedIn: boolean
}

class App extends React.Component<{}, State> {
  constructor (props: {}) {
    super(props)
    const session = spotifyAuth.getSession()

    this.state = {
      albums: [],
      isDragging: false,
      isLoading: false,
      isLoggedIn: session !== undefined && !session.isExpired
    }
  }

  componentDidMount (): void {
    window.addEventListener('drop', this.handleWindowDrop.bind(this))
    window.addEventListener('dragover', this.handleWindowDragStart.bind(this))
    window.addEventListener('dragenter', this.handleWindowDragStart.bind(this))
    window.addEventListener('dragleave', this.handleWindowDragEnd.bind(this))

    const session = spotifyAuth.getSession()

    if (session !== undefined && !session.isExpired) {
      this.resolveAlbums(session)
    }
  }

  componentWillUnmount (): boolean {
    window.removeEventListener('drop', this.handleWindowDrop)
    window.removeEventListener('dragover', this.handleWindowDragStart)
    window.removeEventListener('dragenter', this.handleWindowDragStart)
    window.removeEventListener('dragleave', this.handleWindowDragEnd)
    return true
  }

  handleWindowDrop (e: DragEvent): void {
    e.preventDefault()
    this.setState({ isDragging: false })
    const session = spotifyAuth.getSession()

    if (session === undefined || session.isExpired) {
      return this.setState({ isLoggedIn: false })
    }

    if (e.dataTransfer === null) {
      return
    }

    this.setState({ isLoading: true })

    getPlainTextURIsFromDropEventData(e.dataTransfer)
      .then(URIs => {
        const spotifyURIs = onlySpotifyURIs(URIs)

        if (spotifyURIs.length !== 0) {
          storedItems.append(getItemsFromDroppedURIs(spotifyURIs))
          this.resolveAlbums(session)
        } else {
          this.setState({ isLoading: false })
        }
      }).catch(err => { throw err })
  }

  handleWindowDragStart (e: DragEvent): void {
    e.preventDefault()
    this.setState({ isDragging: true })
  }

  handleWindowDragEnd (e: DragEvent): void {
    e.preventDefault()
    this.setState({ isDragging: false })
  }

  handleOnClearItems (): void {
    if (window.confirm('Are you sure you want to clear all items?')) {
      storedItems.clear()
      this.setState({ albums: [] })
    }
  }

  handleOnLogout (): void {
    if (window.confirm('Are you sure you want to logout?')) {
      spotifyAuth.clearSession()
      this.setState({ albums: [], isLoggedIn: false })
    }
  }

  resolveAlbums (session: SpotifySession): void {
    const api = new SpotifyWebApi()
    api.setAccessToken(session.accessToken)
    const spotify = new SpotifyResolver(api)
    this.setState({ isLoading: true })

    droppedItemsToAlbumIds(spotify, storedItems.get())
      .then(albumIds => {
        const missingAlbumIds = localAlbums.idDifference(albumIds)

        albumsIdsToAlbums(spotify, missingAlbumIds)
          .then(missingAlbums => {
            localAlbums.append(missingAlbums)
            this.setState({ albums: localAlbums.get(), isLoading: false })
          })
          .catch(err => { throw err })
      })
      .catch(err => { throw err })
  }

  render (): JSX.Element {
    const { albums, isDragging, isLoading, isLoggedIn } = this.state

    return (
      <>
        {isLoading && <LoadingOverlay />}
        {isLoggedIn && isDragging && <DraggingOverlay />}

        <div className='app'>
          <Header buttons={
            <div className='buttonContainer'>
              {isLoggedIn && albums.length > 0 && <ClearAllBtn onClearItems={() => this.handleOnClearItems()} />}
              {isLoggedIn && <LogoutBtn onLogout={() => this.handleOnLogout()} />}
            </div>
          }
          />

          <div className='content'>
            {!isLoggedIn && <Login />}
            {isLoggedIn && !isDragging && albums.length === 0 && <DragPrompt />}
            {isLoggedIn && albums.length > 0 && <ReleasesTable albums={albums} merchants={merchants} />}
          </div>

          <Footer />
        </div>
      </>
    )
  }
}

export default App
