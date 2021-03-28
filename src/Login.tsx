import React from 'react'
import { getImplicitGrantURI } from './lib/spotify-auth'

export class Login extends React.Component {
  render (): React.ReactElement {
    return (
      <a
        id='login-with-spotify'
        href={getImplicitGrantURI()}
      >
        Login with Spotify...
      </a>
    )
  }
}
