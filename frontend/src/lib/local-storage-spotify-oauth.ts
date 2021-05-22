import { config } from '../config'
import { TokenResponse } from './models/oauth-token-response'

const localStorageStateKey = 'pkceState'
const localStorageCodeVerifierKey = 'pkceCodeVerifier'

export class LocalStorageSpotifyOAuth {
  private cryptographicallyRandomString (): string {
    const array = new Uint32Array(28)
    window.crypto.getRandomValues(array)
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('')
  }

  private async sha256Encode (plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder()
    return await window.crypto.subtle.digest('SHA-256', encoder.encode(plain))
  }

  private base64URLEncode (s: ArrayBuffer): string {
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(s))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  async storeNewStateAndCodeVerifier (): Promise<void> {
    const state = this.cryptographicallyRandomString()
    const codeVerifier = this.cryptographicallyRandomString()
    localStorage.setItem(localStorageStateKey, state)
    localStorage.setItem(localStorageCodeVerifierKey, codeVerifier)
  }

  async getPKCEAuthorizeURL (): Promise<string> {
    const codeVerifier = localStorage.getItem(localStorageCodeVerifierKey) ?? ''
    const codeChallenge = this.base64URLEncode(await this.sha256Encode(codeVerifier))
    const state = localStorage.getItem(localStorageStateKey) ?? ''

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.spotify.oauth.clientId,
      redirect_uri: config.spotify.oauth.redirectURI,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state
    }).toString()

    return `https://accounts.spotify.com/authorize?${params}`
  }

  getLocalState (): string|null {
    return localStorage.getItem(localStorageStateKey)
  }

  clear (): void {
    localStorage.removeItem(localStorageStateKey)
    localStorage.removeItem(localStorageCodeVerifierKey)
  }

  async getToken (code: string): Promise<TokenResponse> {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: config.spotify.oauth.clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.spotify.oauth.redirectURI,
        code_verifier: localStorage.getItem(localStorageCodeVerifierKey) ?? ''
      }).toString()
    })

    return await res.json()
  }

  async refreshToken (refreshToken: string): Promise<TokenResponse> {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: config.spotify.oauth.clientId,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }).toString()
    })

    return await res.json()
  }
}
