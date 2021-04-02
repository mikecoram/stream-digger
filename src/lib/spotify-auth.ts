const clientId = 'd48e33355f30490aa2a952bbf70055ad'
const redirectURI = 'http://localhost:3000'

function cryptographicallyRandomString (): string {
  const array = new Uint32Array(28)
  window.crypto.getRandomValues(array)
  return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('')
}

async function sha256Encode (plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  return await window.crypto.subtle.digest('SHA-256', encoder.encode(plain))
}

function base64URLEncode (s: ArrayBuffer): string {
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(s))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export const getPKCEAuthorizeURL = async (): Promise<string> => {
  const state = cryptographicallyRandomString()
  const codeVerifier = cryptographicallyRandomString()
  const codeChallenge = base64URLEncode(await sha256Encode(codeVerifier))
  localStorage.setItem('pkce_state', state)
  localStorage.setItem('pkce_code_verifier', codeVerifier)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectURI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state
  }).toString()

  return `https://accounts.spotify.com/authorize?${params}`
}

export const getToken = async (code: string): Promise<any> => {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectURI,
      code_verifier: localStorage.getItem('pkce_code_verifier') ?? ''
    }).toString()
  })

  return await res.json()
}
