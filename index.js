const getSpotifyURIsFromDataTransferItem = (i) => new Promise((resolve, reject) => {
    try {
        i.getAsString(list => resolve(list.split('\n')))
    } catch (error) {
        reject(error)
    }
})

const getSpotifyURIsFromDropHandlerEvent = async (e) => {
    for (const i of e.dataTransfer.items) {
        if (i.type === 'text/plain') {
            return await getSpotifyURIsFromDataTransferItem(i)
        }
    }
}

const dropHandler = async (e) => {
    const spotifyURIs = await getSpotifyURIsFromDropHandlerEvent(e)

    const spotifyObjects = spotifyURIs.map(u => {
        const [ type, id ] = u.split('https://open.spotify.com/')[1].split('/')
        return { id, type }
    })

    console.log(spotifyObjects)
}

const dragoverHandler = (e) => {}

window.addEventListener('dragover', (e) => {
    e.preventDefault()
    dragoverHandler(e)
})

window.addEventListener('drop', (e) => {
    e.preventDefault()
    dropHandler(e)
})

const urlParams = new URLSearchParams(window.location.split('#')[1])
const state = urlParams.get('state')

const isSpotifyAuthCallback = state !== null
console.log(isSpotifyAuthCallback)

if (isSpotifyAuthCallback) {
    const error = urlParams.get('error')
    
    if (error !== null) {
        console.log(error)
        console.log(JSON.stringify(error))

        urlParams.delete('error')
        throw error
    }
    
    const accessToken = urlParams.get('access_token')
    const tokenType = urlParams.get('token_type')
    const expiresIn = urlParams.get('expires_in')

    console.log(accessToken, tokenType, expiresIn)
} else {
    const spotifyAuthParams = new URLSearchParams({
        'client_id': 'd48e33355f30490aa2a952bbf70055ad',
        'redirect_uri': 'https://mikecoram.github.io/buy-music/',
        'response_type': 'token',
        'state': Math.random().toString()
    });

    const spotifyAuthURL = `https://accounts.spotify.com/authorize?${spotifyAuthParams.toString()}`
    document.getElementById('login-with-spotify').setAttribute('href', spotifyAuthURL)
}