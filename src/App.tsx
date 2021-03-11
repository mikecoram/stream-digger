import React from 'react'
import { getImplicitGrantURI } from './lib/spotify-auth'
import './App.css'

interface Props {
  isLoggedIn: boolean
  albums: SpotifyApi.AlbumObjectFull[]
}

class App extends React.Component<Props> {
  render (): JSX.Element {
    const { isLoggedIn, albums } = this.props

    if (!isLoggedIn) {
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
        {
          albums.map(o => {
            const source = 'bandcamp'
            const track = `${o.artists.map(a => a.name).join(', ')} ${o.name}`
            const q = `${source} ${track}`
            const searchURI = encodeURI(`https://google.com/search?q=${q}`)
            return (
              <li key={o.id}>
                <a href={searchURI} key={o.id}>{track}</a>
              </li>
            )
          })
        }
      </>
    )
  }
}

export default App
