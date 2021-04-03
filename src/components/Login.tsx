import React from 'react'
import { LocalStorageSpotifyOAuth } from '../lib/local-storage-spotify-oauth'
import './Login.css'

export class Login extends React.Component {
  async handleClick (): Promise<void> {
    const oauth = new LocalStorageSpotifyOAuth()
    await oauth.storeNewStateAndCodeVerifier()
    const redirectURL = await oauth.getPKCEAuthorizeURL()
    window.location.replace(redirectURL)
  }

  render (): React.ReactElement {
    return (
      <a
        id='login-with-spotify'
        className='loginWithSpotify'
        href='#'
        onClick={async () => await this.handleClick()}
      >
        Login with Spotify
      </a>
    )
  }
}
