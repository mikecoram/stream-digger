import React from 'react'
import './App.css'
import { Album } from '../lib/models/album'
import { droppedItemsToAlbums } from '../lib/spotify-resolve-dropped-items'
import { getItemsFromDroppedURIs, getPlainTextURIsFromDropEventData, onlySpotifyURIs } from '../lib/spotify-drop-on-page'
import { LocalStorageDroppedSpotifyItems } from '../lib/local-storage-dropped-spotify-items'
import { LocalStorageSpotifyAuth } from '../lib/local-storage-spotify-auth'
import { Login } from './Login'
import { merchants } from '../lib/merchants'
import { SpotifyResolver } from '../lib/spotify-resolver'
import ClearAllBtn from './ClearAllBtn'
import DragoverPrompt from './DragoverPrompt'
import DragPrompt from './DragPrompt'
import Footer from './Footer'
import Header from './Header'
import LogoutBtn from './LogoutBtn'
import ReleasesTable from './releases-table/ReleasesTable'
import SpotifyWebApi from 'spotify-web-api-js'
import { SpotifySession } from '../lib/models/spotify-session'

const spotifyAuth = new LocalStorageSpotifyAuth()
const storedItems = new LocalStorageDroppedSpotifyItems()

interface State {
  albums: Album[]
  isDragging: boolean
  isLoggedIn: boolean
}

class App extends React.Component<{}, State> {
  constructor (props: {}) {
    super(props)
    const session = spotifyAuth.getSession()

    this.state = {
      albums: [],
      isDragging: false,
      isLoggedIn: session !== undefined && !session.isExpired
    }
  }

  componentDidMount (): void {
    window.addEventListener('drop', this.handleWindowDrop.bind(this))
    window.addEventListener('dragover', this.handleWindowDragStart.bind(this))
    window.addEventListener('dragenter', this.handleWindowDragStart.bind(this))
    window.addEventListener('dragleave', this.handleWindowDragEnd.bind(this))

    const session = spotifyAuth.getSession()

    if (session !== undefined) {
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

    getPlainTextURIsFromDropEventData(e.dataTransfer)
      .then(URIs => {
        const spotifyURIs = onlySpotifyURIs(URIs)

        if (spotifyURIs.length !== 0) {
          storedItems.append(getItemsFromDroppedURIs(spotifyURIs))
          this.resolveAlbums(session)
        }
      }).catch(err => { throw err })
  }

  handleWindowDragStart (e: DragEvent): void {
    e.preventDefault()
    this.setState({ isDragging: true })
  }

  handleWindowDragEnd (e: DragEvent): void {
    e.preventDefault()
    this.setState({ isDragging: true })
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
    droppedItemsToAlbums(spotify, storedItems.get())
      .then(albums => this.setState({ albums }))
      .catch(err => { throw err })
  }

  buttons (): JSX.Element {
    const { albums } = this.state

    return (
      <div className='buttonContainer'>
        {
          albums.length > 0
            ? <ClearAllBtn onClearItems={() => this.handleOnClearItems()} />
            : null
        }
        <LogoutBtn onLogout={() => this.handleOnLogout()} />
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
    return (
      <div className='app'>
        <Header buttons={this.buttons()} />
        <div className='content'>
          {this.content()}
        </div>
        <Footer />
      </div>
    )
  }
}

export default App
