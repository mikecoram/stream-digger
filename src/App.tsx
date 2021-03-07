import React from 'react'
import { SpotifySession } from './lib/models/spotify-session'
import { getImplicitGrantURI } from './lib/spotify-auth'
import './App.css'
import { DroppedSpotifyItem } from './lib/models/spotify-drop'

class App extends React.Component<{spotifySession: SpotifySession | null, droppedItems?: DroppedSpotifyItem[]}> {
  render (): JSX.Element {
    const { spotifySession, droppedItems } = this.props

    if (spotifySession === null || spotifySession.isExpired) {
      return (
        <a
          id='login-with-spotify'
          href={getImplicitGrantURI()}
        >
          Login with Spotify...
        </a>
      )
    }

    if (droppedItems === undefined || droppedItems === null) {
      return (
        <div>You're logged in</div>
      )
    }

    return (
      <>
        {droppedItems.map(o => <div key={o.id}>{o.id}</div>)}
      </>
    )
  }
}

export default App
