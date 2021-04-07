import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './components/App'
import { LocalStorageOAuthSession } from './lib/local-storage-oauth-session'
import { LocalStorageSpotifyOAuth } from './lib/local-storage-spotify-oauth'

const oauthCallbackParams = new URLSearchParams(window.location.search)

if (oauthCallbackParams.get('state') !== null) {
  const error = oauthCallbackParams.get('error')

  if (error !== null) {
    throw new Error(error)
  }

  const oauth = new LocalStorageSpotifyOAuth()
  const state = oauthCallbackParams.getAll('state')[0]
  const code = oauthCallbackParams.getAll('code')[0]

  if (state === oauth.getLocalState()) {
    oauth.getToken(code)
      .then(res => {
        const localSession = new LocalStorageOAuthSession()
        localSession.setFromTokenResponse(res)
        oauth.clear()
        window.location.replace(`${window.location.pathname}`)
      })
      .catch(err => { throw err })
  }
} else {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  )
}
