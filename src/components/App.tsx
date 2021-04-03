import React from 'react'
import './App.css'
import { Album } from '../lib/models/album'
import { droppedItemsToAlbumIds, albumsIdsToAlbums } from '../lib/spotify-resolve-dropped-items'
import { getItemsFromDroppedURIs, getPlainTextURIsFromDropEventData, onlySpotifyURIs } from '../lib/spotify-drop-on-page'
import { LocalStorageAlbums } from '../lib/local-storage-albums'
import { LocalStorageDroppedSpotifyItems } from '../lib/local-storage-dropped-spotify-items'
import { LocalStorageSpotifyOAuth } from '../lib/local-storage-spotify-oauth'
import { LocalStorageSpotifySession } from '../lib/local-storage-spotify-session'
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

const localSession = new LocalStorageSpotifySession()
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
    const session = localSession.get()

    this.state = {
      albums: [],
      isDragging: false,
      isLoading: false,
      isLoggedIn: session !== undefined && !session.isExpired
    }
  }

  async componentDidMount (): Promise<void> {
    window.addEventListener('drop', this.handleWindowDrop.bind(this))
    window.addEventListener('dragover', this.handleWindowDragStart.bind(this))
    window.addEventListener('dragenter', this.handleWindowDragStart.bind(this))
    window.addEventListener('dragleave', this.handleWindowDragEnd.bind(this))

    const session = localSession.get()

    if (session === undefined) {
      return
    }

    await this.refreshSession(session)
    this.resolveAlbums(session)
  }

  async refreshSession (session: SpotifySession): Promise<void> {
    if (session.isExpired) {
      const oauth = new LocalStorageSpotifyOAuth()
      const res = await oauth.refreshToken(session.refreshToken)
      oauth.clear()
      localSession.setFromTokenResponse(res)
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
    const session = localSession.get()

    if (session === undefined || e.dataTransfer === null) {
      return
    }

    const data = e.dataTransfer
    this.setState({ isLoading: true })

    this.refreshSession(session).then(() => {
      getPlainTextURIsFromDropEventData(data)
        .then(URIs => {
          const spotifyURIs = onlySpotifyURIs(URIs)

          if (spotifyURIs.length !== 0) {
            storedItems.append(getItemsFromDroppedURIs(spotifyURIs))
            this.resolveAlbums(session)
          } else {
            this.setState({ isLoading: false })
          }
        }).catch(err => { throw err })
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
      localSession.clear()
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

  handleOnChangeAlbum (album: Album): void {
    localAlbums.setOne(album)
    this.setState({ albums: localAlbums.get() })
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
            {
              isLoggedIn && albums.length > 0 &&
                <ReleasesTable
                  albums={albums}
                  merchants={merchants}
                  onChangeAlbum={this.handleOnChangeAlbum.bind(this)}
                />
            }
          </div>

          <Footer />
        </div>
      </>
    )
  }
}

export default App
