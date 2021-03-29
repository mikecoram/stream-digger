import React from 'react'
import { getImplicitGrantURI } from '../lib/spotify-auth'
import './Login.css'

export class Login extends React.Component {
  render (): React.ReactElement {
    return (
      <a
        id='login-with-spotify'
        className='loginWithSpotify'
        href={getImplicitGrantURI()}
      >
        Login with Spotify
      </a>
    )
  }
}
