import { SpotifySession, SpotifyAuthSetResult } from './models/spotify-session'

const localStorageKey = 'spotifySession'

export class LocalStorageSpotifyAuth {
  getSession (): SpotifySession | null {
    const item = localStorage.getItem(localStorageKey)

    if (item === null) {
      return null
    }

    const data = JSON.parse(item) as SpotifySession
    data.isExpired = new Date(data.expiryTime).getTime() < Date.now()
    return data
  }

  setSessionFromCallbackHashFragment (hashFragment: string): SpotifyAuthSetResult {
    const params = new URLSearchParams(hashFragment)
    const error = params.get('error')

    if (error !== null) {
      console.log(error)
      console.log(JSON.stringify(error))
      localStorage.removeItem(localStorageKey)
      return { success: false, error }
    }

    const callbackData: SpotifySession = {
      accessToken: params.get('access_token') as string,
      state: params.get('state') as string,
      tokenType: params.get('token_type') as string,
      expiryTime: new Date(
        new Date().getTime() + (Number.parseInt(params.get('expires_in') as string, 0) * 1000)
      ).toString(),
      isExpired: false
    }

    for (const p of params.keys()) {
      params.delete(p)
    }

    localStorage.setItem(localStorageKey, JSON.stringify(callbackData))

    return { success: true }
  }
}
