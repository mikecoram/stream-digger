export interface SpotifySession {
  accessToken: string | null
  expiryTime: string
  state: string | null
  tokenType: string | null
  isExpired: boolean
}

export interface SpotifyAuthSetResult {
  success: boolean
  error?: string
}
