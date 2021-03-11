export interface SpotifySession {
  accessToken: string
  expiryTime: string
  state: string
  tokenType: string
  isExpired: boolean
}

export interface SpotifyAuthSetResult {
  success: boolean
  error?: string
}
