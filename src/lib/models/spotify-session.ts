export type SpotifySession = {
  accessToken: string
  expiryTime: string
  expiresIn: number
  state: string
  tokenType: string 
  isExpired: boolean
}

export type SpotifyAuthSetResult = {
  success: boolean,
  error?: string
}
