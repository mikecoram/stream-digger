import React from 'react'
import './App.css'
import { Album } from '../lib/models/album'
import { SpotifyDropResolver } from '../lib/spotify-resolve-drops'
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

interface State {
  albums: Album[]
  importedTracks: Track[]
  isDragging: boolean
  isLoading: boolean
  isLoggedIn: boolean
}

class App extends React.Component<{}, State> {
  localSession = new LocalStorageSpotifySession()
  localDrops = new LocalStorageDrops()
  localAlbums = new LocalStorageAlbums()
  localTracks = new LocalStorageTracks()

  constructor (props: {}) {
    super(props)

    this.state = {
      albums: [],
      importedTracks: [],
      isDragging: false,
      isLoading: false,
      isLoggedIn: this.localSession.get() !== undefined
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
          albums: this.localAlbums.get(),
          importedTracks: this.localTracks.get(),
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
        this.localDrops.append(getDropsFromURIs(URIs))
        this.hydrateLocalSpotifyObjects()
          .then(() => this.setState({
            albums: this.localAlbums.get(),
            importedTracks: this.localTracks.get(),
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
      this.localDrops.clear()
      this.localTracks.clear()
      this.localAlbums.clear()
      this.setState({ albums: [] })
    }
  }

  handleLogout (): void {
    if (window.confirm('Are you sure you want to logout?')) {
      this.localSession.clear()
      this.setState({ albums: [], isLoggedIn: false })
    }
  }

  handleChangeAlbum (album: Album): void {
    this.localAlbums.setOne(album)
    this.setState({ albums: this.localAlbums.get() })
  }

  async getRefreshedToken (): Promise<string> {
    const session = this.localSession.get()

    if (session === undefined) {
      throw new Error('no local session')
    }

    if (!session.isExpired) {
      return session.accessToken
    }

    const oauth = new LocalStorageSpotifyOAuth()
    const res = await oauth.refreshToken(session.refreshToken)
    oauth.clear()
    this.localSession.setFromTokenResponse(res)
    const refreshedSession = this.localSession.get()

    if (refreshedSession === undefined) {
      throw new Error('no local session after refresh')
    }

    return refreshedSession.accessToken
  }

  async getDroppedSpotifyURIs (data: DataTransfer): Promise<string[]> {
    return onlySpotifyURIs(await getPlainTextURIsFromDropEventData(data))
  }

  async hydrateLocalSpotifyObjects (): Promise<void> {
    const spotify = new SpotifyWebApi()
    spotify.setAccessToken(await this.getRefreshedToken())
    const spotifyResolver = new SpotifyResolver(spotify)
    const unresolvedDrops = this.localDrops.get().filter(d => !d.resolved)
    const dropResolver = new SpotifyDropResolver(spotifyResolver)

    const [albumIds, trackIds] = await Promise.all([
      dropResolver.dropsToAlbumIds(unresolvedDrops),
      dropResolver.dropsToTrackIds(unresolvedDrops)
    ])

    this.localDrops.set(unresolvedDrops.map(d => {
      d.resolved = true
      return d
    }))

    const [albums, tracks] = await Promise.all([
      spotifyResolver.albumsToAlbums(this.localAlbums.idDifference(albumIds)),
      spotifyResolver.tracksToTracks(this.localTracks.idDifference(trackIds))
    ])

    this.localTracks.append(tracks)
    this.localAlbums.append(albums.map(a => {
      a.bought = false
      return a
    }))
  }

  async hydrateTracksWithAudioFeatures (tracks: Track[]): Promise<void> {
    const api = new SpotifyWebApi()
    api.setAccessToken(await this.getRefreshedToken())
    const trackIds = tracks.map(t => t.id)
    const tracksToUpdate = this.localTracks.get().filter(t => trackIds.includes(t.id))
    const res = await api.getAudioFeaturesForTracks(trackIds)

    this.localTracks.update(tracksToUpdate.map(t => {
      t.audioFeatures = res.audio_features.find(a => a.id === t.id)
      return t
    }))
  }

  handleImportedTracksMoreInfo (tracks: Track[]): void {
    this.setState({ isLoading: true })
    this.hydrateTracksWithAudioFeatures(tracks)
      .then(() => this.setState({
        importedTracks: this.localTracks.get(),
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
