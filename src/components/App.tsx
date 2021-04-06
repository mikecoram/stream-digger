import React from 'react'
import './App.css'
import { Album } from '../lib/models/album'
import { dropsToAlbumIds, albumsIdsToAlbums, dropsToTrackIds, trackIdsToTracks } from '../lib/spotify-resolve-drops'
import { getDropsFromURIs, getPlainTextURIsFromDropEventData, onlySpotifyURIs } from '../lib/spotify-drop-on-page'
import { LocalStorageAlbums } from '../lib/local-storage-albums'
import { LocalStorageDrops } from '../lib/local-storage-drops'
import { LocalStorageSpotifyOAuth } from '../lib/local-storage-spotify-oauth'
import { LocalStorageSpotifySession } from '../lib/local-storage-spotify-session'
import { LocalStorageTracks } from '../lib/local-storage-tracks'
import { Login } from './Login'
import { merchants } from '../lib/merchants'
import { SpotifyResolver } from '../lib/spotify-resolver'
import { Track } from '../lib/models/track'
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
const localDrops = new LocalStorageDrops()

interface State {
  albums: Album[]
  importedTracks: Track[]
  isDragging: boolean
  isLoading: boolean
  isLoggedIn: boolean
}

class App extends React.Component<{}, State> {
  constructor (props: {}) {
    super(props)

    this.state = {
      albums: [],
      importedTracks: [],
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
      this.hydrateLocalSpotifyObjects()
        .then(() => this.setState({
          albums: localAlbums.get(),
          importedTracks: localTracks.get(),
          isLoading: false
        }))
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

    this.getDroppedSpotifyURIs(e.dataTransfer)
      .then(URIs => {
        if (URIs.length === 0) {
          return this.setState({ isDragging: false })
        }

        this.setState({ isDragging: false, isLoading: true })
        localDrops.append(getDropsFromURIs(URIs))
        this.hydrateLocalSpotifyObjects()
          .then(() => this.setState({
            albums: localAlbums.get(),
            importedTracks: localTracks.get(),
            isLoading: false
          }))
          .catch(err => { throw err })
      })
      .catch(err => { throw err })
  }

  handleWindowDragStart (e: DragEvent): void {
    e.preventDefault()

    if (!this.state.isDragging) {
      this.setState({ isDragging: true })
    }
  }

  handleWindowDragEnd (e: DragEvent): void {
    e.preventDefault()

    if (this.state.isDragging) {
      this.setState({ isDragging: false })
    }
  }

  handleClearItems (): void {
    if (window.confirm('Are you sure you want to clear all items?')) {
      localDrops.clear()
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

  async getRefreshedToken (): Promise<string> {
    const session = localSession.get()

    if (session === undefined) {
      throw new Error('no local session')
    }

    if (!session.isExpired) {
      return session.accessToken
    }

    const oauth = new LocalStorageSpotifyOAuth()
    const res = await oauth.refreshToken(session.refreshToken)
    oauth.clear()
    localSession.setFromTokenResponse(res)
    const refreshedSession = localSession.get()

    if (refreshedSession === undefined) {
      throw new Error('no local session after refresh')
    }

    return refreshedSession.accessToken
  }

  async getDroppedSpotifyURIs (data: DataTransfer): Promise<string[]> {
    return onlySpotifyURIs(await getPlainTextURIsFromDropEventData(data))
  }

  async hydrateLocalSpotifyObjects (): Promise<void> {
    const api = new SpotifyWebApi()
    api.setAccessToken(await this.getRefreshedToken())
    const spotify = new SpotifyResolver(api)
    const drops = localDrops.get()

    const [albumIds, trackIds] = await Promise.all([
      dropsToAlbumIds(spotify, drops),
      dropsToTrackIds(spotify, drops)
    ])

    const [albums, tracks] = await Promise.all([
      albumsIdsToAlbums(spotify, localAlbums.idDifference(albumIds)),
      trackIdsToTracks(spotify, localTracks.idDifference(trackIds))
    ])

    localTracks.append(tracks)
    localAlbums.append(albums)

    const newAlbums = localAlbums.get().map(a => {
      a.bought = false
      return a
    })

    localAlbums.set(newAlbums)
  }

  async hydrateTracksWithAudioFeatures (tracks: Track[]): Promise<void> {
    const api = new SpotifyWebApi()
    api.setAccessToken(await this.getRefreshedToken())
    const trackIds = tracks.map(t => t.id)
    const tracksToUpdate = localTracks.get().filter(t => trackIds.includes(t.id))
    const res = await api.getAudioFeaturesForTracks(trackIds)

    localTracks.update(tracksToUpdate.map(t => {
      t.audioFeatures = res.audio_features.find(a => a.id === t.id)
      return t
    }))
  }

  handleImportedTracksMoreInfo (tracks: Track[]): void {
    this.setState({ isLoading: true })
    this.hydrateTracksWithAudioFeatures(tracks)
      .then(() => this.setState({
        importedTracks: localTracks.get(),
        isLoading: false
      }))
      .catch(err => { throw err })
  }

  render (): JSX.Element {
    const { albums, importedTracks, isDragging, isLoading, isLoggedIn } = this.state

    return (
      <>
        {
          isLoading &&
            <LoadingOverlay />
        }
        {
          isLoggedIn && isDragging &&
            <DraggingOverlay />
        }

        <div className='app'>
          <Header buttons={
            <div className='buttonContainer'>
              {
                isLoggedIn && albums.length > 0 &&
                  <ClearAllBtn onClearItems={() => this.handleClearItems()} />
              }
              {
                isLoggedIn &&
                  <LogoutBtn onLogout={() => this.handleLogout()} />
              }
            </div>
          }
          />

          <div className='content'>
            {
              !isLoggedIn &&
                <Login />
            }
            {
              isLoggedIn && !isDragging && !isLoading && albums.length === 0 &&
                <DragPrompt />
            }
            {
              isLoggedIn && albums.length > 0 &&
                <ReleasesTable
                  albums={albums}
                  importedTracks={importedTracks}
                  merchants={merchants}
                  onChangeAlbum={this.handleChangeAlbum.bind(this)}
                  onClickImportedTracksMoreInfo={this.handleImportedTracksMoreInfo.bind(this)}
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
