export const storeSpotifyAuthInLocalStorage = (hashFragment) => {
    const params = new URLSearchParams(hashFragment)
    const callbackData = {}

    for (const p of ['access_token', 'error', 'expires_in', 'state', 'token_type']) {
        callbackData[p] = params.get(p)
        params.delete(p)
    }

    if (callbackData.error !== null) {
        console.log(error)
        console.log(JSON.stringify(error))
        localStorage.removeItem('spotifyAuth')
        throw error
    }

    callbackData['expiry_time'] = new Date(
        new Date().getTime() + (callbackData['expires_in'] * 1000)
    )

    localStorage.setItem('spotifyAuth', JSON.stringify(callbackData))
}
