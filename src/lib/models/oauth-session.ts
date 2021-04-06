export interface OAuthSession {
  accessToken: string
  refreshToken: string
  expiryTime: string
  state: string
  tokenType: string
  isExpired: boolean
}
