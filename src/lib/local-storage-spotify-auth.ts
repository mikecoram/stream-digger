import { SpotifySession, SpotifyAuthSetResult } from './models/spotify-session';

export class LocalStorageSpotifyAuth {
  getSession() : SpotifySession | null {
    const item = localStorage.getItem('spotifyAuth')

    if (!item) {
      return null
    }

    const data = JSON.parse(item) as SpotifySession
    data.isExpired = new Date(data.expiryTime).getTime() > Date.now()
    return data
  }

  setSessionFromCallbackHashFragment(hashFragment : string) : SpotifyAuthSetResult {
    const params = new URLSearchParams(hashFragment)
    const error = params.get('error')
  
    if (error !== null) {
      console.log(error)
      console.log(JSON.stringify(error))
      localStorage.removeItem('spotifyAuth')
      return { success: false, error }
    }
  
    const callbackData = {
      accessToken: params.get('access_token'),
      state: params.get('state'),
      tokenType: params.get('token_type'),
      expiryTime: new Date(
        new Date().getTime() + (Number.parseInt(params.get('expires_in') as string, 0) * 1000)
      ).toString()
    } as SpotifySession
  
    for (const p of params.keys()) {
        params.delete(p)
    }
  
    localStorage.setItem('spotifyAuth', JSON.stringify(callbackData))

    return { success: true }
  }
}
