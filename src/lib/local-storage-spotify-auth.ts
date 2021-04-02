import { SpotifySession, SpotifyAuthSetResult } from './models/spotify-session'

const key = 'spotifySession'

export class LocalStorageSpotifyAuth {
  getSession (): SpotifySession | undefined {
    const item = localStorage.getItem(key)

    if (item === null) {
      return undefined
    }

    const data = JSON.parse(item) as SpotifySession
    data.isExpired = new Date(data.expiryTime).getTime() < Date.now()
    return data
  }

  setSessionFromTokenResponse(res: any): void {
    localStorage.setItem(key, JSON.stringify({
      accessToken: res.access_token,
      tokenType: res.token_type,
      refreshToken: res.refresh_token,
      expiryTime: new Date(
        new Date().getTime() + (Number.parseInt(res.expires_in, 0) * 1000)
      ).toString(),
      isExpired: false
    }))
  }

  clearSession (): void {
    localStorage.removeItem(key)
  }
}
