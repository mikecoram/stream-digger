export const config = {
  spotify: {
    oauth: {
      clientId: process.env.REACT_APP_SPOTIFY_OAUTH_CLIENT_ID ?? 'MISSING',
      redirectURI: process.env.REACT_APP_SPOTIFY_OAUTH_REDIRECT_URI ?? 'MISSING'
    }
  }
}
