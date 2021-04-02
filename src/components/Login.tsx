import React from 'react'
import { getPKCEAuthorizeURL } from '../lib/spotify-auth'
import './Login.css'

export class Login extends React.Component<{}, { href: string }> {
  constructor(props: {}) {
    super(props)
    this.state = { href: '' }
  }

  async componentDidMount() {
    this.setState({ href: await getPKCEAuthorizeURL()} )
  }

  render (): React.ReactElement {
    const { href } = this.state

    return (
      <a
        id='login-with-spotify'
        className='loginWithSpotify'
        href={href}
      >
        Login with Spotify
      </a>
    )
  }
}
