import React from 'react'
import './App.css'
import { Album } from '../lib/models/album'
import { droppedItemsToAlbumIds, albumsIdsToAlbums, droppedItemsToTrackIds, trackIdsToTracks } from '../lib/spotify-resolve-dropped-items'
import { getItemsFromDroppedURIs, getPlainTextURIsFromDropEventData, onlySpotifyURIs } from '../lib/spotify-drop-on-page'
import { LocalStorageAlbums } from '../lib/local-storage-albums'
import { LocalStorageDroppedSpotifyItems } from '../lib/local-storage-dropped-spotify-items'
import { LocalStorageSpotifyOAuth } from '../lib/local-storage-spotify-oauth'
import { LocalStorageSpotifySession } from '../lib/local-storage-spotify-session'
import { LocalStorageTracks } from '../lib/local-storage-tracks'
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

const localAlbums = new LocalStorageAlbums()
const localSession = new LocalStorageSpotifySession()
const localTracks = new LocalStorageTracks()
const storedItems = new LocalStorageDroppedSpotifyItems()

interface State {
  albums: Album[]
  isDragging: boolean
  isLoading: boolean
  isLoggedIn: boolean
}

class App extends React.Component<{}, State> {
  constructor (props: {}) {
    super(props)

    this.state = {
      albums: [],
      isDragging: false,
      isLoading: false,
      isLoggedIn: localSession.get() !== undefined
    }
  }

  componentDidMount (): void {
    window.addEventListener('drop', this.handleWindowDrop.bind(this))
    window.addEventListener('dragover', this.handleWindowDragStart.bind(this))
    window.addEventListener('dragenter', this.handleWindowDragStart.bind(this))
    window.addEventListener('dragleave', this.handleWindowDragEnd.bind(this))

    if (this.state.isLoggedIn) {
      this.setState({ isLoading: true })
      this.getAlbums()
        .then(albums => this.setState({ albums, isLoading: false }))
        .catch(err => { throw err })
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

    if (e.dataTransfer === null || !this.state.isLoggedIn) {
      this.setState({ isDragging: false })
      return
    }

    this.setState({ isDragging: false, isLoading: true })
    this.getAlbumsWithDropped(e.dataTransfer)
      .then(albums => this.setState({ albums, isLoading: false }))
      .catch(err => { throw err })
  }

  handleWindowDragStart (e: DragEvent): void {
    e.preventDefault()
    this.setState({ isDragging: true })
  }

  handleWindowDragEnd (e: DragEvent): void {
    e.preventDefault()
    this.setState({ isDragging: false })
  }

  handleClearItems (): void {
    if (window.confirm('Are you sure you want to clear all items?')) {
      storedItems.clear()
      localTracks.clear()
      localAlbums.clear()
      this.setState({ albums: [] })
    }
  }

  handleLogout (): void {
    if (window.confirm('Are you sure you want to logout?')) {
      localSession.clear()
      this.setState({ albums: [], isLoggedIn: false })
    }
  }

  handleChangeAlbum (album: Album): void {
    localAlbums.setOne(album)
    this.setState({ albums: localAlbums.get() })
  }

  async getRefreshedSession (): Promise<SpotifySession> {
    const session = localSession.get()

    if (session === undefined) {
      throw new Error('no local session')
    }

    if (session.isExpired) {
      const oauth = new LocalStorageSpotifyOAuth()
      const res = await oauth.refreshToken(session.refreshToken)
      oauth.clear()
      localSession.setFromTokenResponse(res)
    }

    return session
  }

  async getAlbumsWithDropped (data: DataTransfer): Promise<Album[]> {
    const spotifyURIs = onlySpotifyURIs(await getPlainTextURIsFromDropEventData(data))

    if (spotifyURIs.length === 0) {
      return localAlbums.get()
    }

    storedItems.append(getItemsFromDroppedURIs(spotifyURIs))
    return await this.getAlbums()
  }

  async getAlbums (): Promise<Album[]> {
    const session = await this.getRefreshedSession()
    const api = new SpotifyWebApi()
    api.setAccessToken(session.accessToken)
    const spotify = new SpotifyResolver(api)

    const [albumIds, trackIds] = await Promise.all([
      droppedItemsToAlbumIds(spotify, storedItems.get()),
      droppedItemsToTrackIds(spotify, storedItems.get())
    ])

    const [albums, tracks] = await Promise.all([
      albumsIdsToAlbums(spotify, localAlbums.idDifference(albumIds)),
      trackIdsToTracks(spotify, localTracks.idDifference(trackIds))
    ])

    localTracks.append(tracks)
    localAlbums.append(albums)

    const newAlbums = localAlbums.get().map(a => {
      a.bought = false
      a.importedTracks = (a.importedTracks ?? []).concat(tracks.filter(t => t.album.id === a.id))
      return a
    })

    localAlbums.set(newAlbums)
    return localAlbums.get()
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
              {isLoggedIn && albums.length > 0 && <ClearAllBtn onClearItems={() => this.handleClearItems()} />}
              {isLoggedIn && <LogoutBtn onLogout={() => this.handleLogout()} />}
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
                  onChangeAlbum={this.handleChangeAlbum.bind(this)}
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
