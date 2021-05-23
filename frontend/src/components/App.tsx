import React from 'react'
import './App.css'
import { Album } from '../lib/models/album'
import { getDropsFromURIs, onlySpotifyURIs } from '../lib/spotify-uris'
import { LocalStorageAlbums } from '../lib/local-storage-albums'
import { LocalStorageDrops } from '../lib/local-storage-drops'
import { LocalStorageOAuthSession } from '../lib/local-storage-oauth-session'
import { LocalStorageSpotifyOAuth } from '../lib/local-storage-spotify-oauth'
import { LocalStorageTracks } from '../lib/local-storage-tracks'
import { Login } from './Login'
import { merchants } from '../lib/merchants'
import { SpotifyDropResolver } from '../lib/spotify-drop-resolver'
import { SpotifyResolver } from '../lib/spotify-resolver'
import { Track } from '../lib/models/track'
import DragPrompt from './DragPrompt'
import Footer from './Footer'
import Header from './Header'
import LoadingOverlay from './LoadingOverlay'
import ReleasesTable from './releases-table/ReleasesTable'
import SpotifyWebApi from 'spotify-web-api-js'
import { getPlainTextURIsFromDropEventData } from '../lib/drag-event-data'

interface State {
  albums: Album[]
  importedTracks: Track[]
  isLoading: boolean
  isLoggedIn: boolean
}

class App extends React.Component<{}, State> {
  localSession = new LocalStorageOAuthSession()
  localDrops = new LocalStorageDrops()
  localAlbums = new LocalStorageAlbums()
  localTracks = new LocalStorageTracks()

  constructor (props: {}) {
    super(props)

    this.state = {
      albums: [],
      importedTracks: [],
      isLoading: false,
      isLoggedIn: this.localSession.exists()
    }
  }

  componentDidMount (): void {
    window.addEventListener('drop', this.handleWindowDrop.bind(this))
    window.addEventListener('dragover', this.handleWindowDragStart.bind(this))
    window.addEventListener('dragenter', this.handleWindowDragStart.bind(this))
    window.addEventListener('dragleave', this.handleWindowDragEnd.bind(this))

    if (this.state.isLoggedIn) {
      this.setState({ isLoading: true })
      this.resolveAlbumsAndTracks()
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
      return
    }

    this.getDroppedSpotifyURIs(e.dataTransfer)
      .then(URIs => {
        if (URIs.length === 0) {
          return
        }

        this.setState({ isLoading: true })
        this.localDrops.append(getDropsFromURIs(URIs))
        this.resolveAlbumsAndTracks()
          .then(() => this.setState({
            albums: this.localAlbums.get(),
            importedTracks: this.localTracks.get(),
            isLoading: false
          }))
          .catch(err => { throw err })
      })
      .catch(err => { throw err })
  }

  handleWindowDragStart (e: DragEvent): boolean {
    e.preventDefault()
    return true
  }

  handleWindowDragEnd (e: DragEvent): void {
    e.preventDefault()
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

    if (!session.isExpired) {
      return session.accessToken
    }

    const oauth = new LocalStorageSpotifyOAuth()
    const res = await oauth.refreshToken(session.refreshToken)
    oauth.clear()
    this.localSession.setFromTokenResponse(res)
    return this.localSession.get().accessToken
  }

  async getDroppedSpotifyURIs (data: DataTransfer): Promise<string[]> {
    return onlySpotifyURIs(await getPlainTextURIsFromDropEventData(data))
  }

  async resolveAlbumsAndTracks (): Promise<void> {
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

  async resolveAudioFeaturesForTracks (tracks: Track[]): Promise<void> {
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
    this.resolveAudioFeaturesForTracks(tracks)
      .then(() => this.setState({
        importedTracks: this.localTracks.get()
      }))
      .catch(err => { throw err })
  }

  render (): JSX.Element {
    const { albums, importedTracks, isLoading, isLoggedIn } = this.state

    return (
      <>
        {
          isLoading &&
            <LoadingOverlay />
        }

        <div className='app'>
          <Header buttons={
            <div className='buttonContainer'>
              {
                isLoggedIn && albums.length > 0 &&
                  <button onClick={() => this.handleClearItems()}>Clear All</button>
              }
              {
                isLoggedIn &&
                  <button onClick={() => this.handleLogout()}>Logout</button>
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
              isLoggedIn && !isLoading && albums.length === 0 &&
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
