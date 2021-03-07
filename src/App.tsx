import './App.css'
import { SpotifySession } from './lib/models/spotify-session';

const spotifyAuthParams = new URLSearchParams({
  'client_id': 'd48e33355f30490aa2a952bbf70055ad',
  'redirect_uri': 'https://mikecoram.github.io/buy-music',
  'response_type': 'token',
  'state': Math.random().toString()
})

function getSpotifyHref () : string {
  return `https://accounts.spotify.com/authorize?${spotifyAuthParams.toString()}`
}

type Props = {
  spotifySession: SpotifySession | null
}

function App ({ spotifySession }: Props) {
  if (spotifySession === null || spotifySession.isExpired) {
    return (
      <a
      id="login-with-spotify"
      href={getSpotifyHref()}
      >
        Login with Spotify...
      </a>
    )
  }

  return (
    <div>You are logged in with Spotify!</div>
  )
}

export default App
