import React from 'react'
import { SpotifySession } from './lib/models/spotify-session'
import { getImplicitGrantURI } from './lib/spotify-auth'
import './App.css'
import { DroppedSpotifyItem } from './lib/models/spotify-drop'

class App extends React.Component<{spotifySession: SpotifySession | null, items: DroppedSpotifyItem[]}> {
  render (): JSX.Element {
    const { spotifySession, items } = this.props

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

    return (
      <>
        {items.map(o => <div key={o.id}>{o.id}</div>)}
      </>
    )
  }
}

export default App
