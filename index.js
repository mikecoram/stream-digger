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

document.addEventListener('DOMContentLoaded', _e => {
    const hashFragment = window.location.toString().split('#')[1]
    const isSpotifyAuthCallback = hashFragment !== undefined

    if (isSpotifyAuthCallback) {
        storeSpotifyAuthInLocalStorage(hashFragment)
        window.location.replace(`${window.location.pathname}`)
        return
    }

    const spotifyAuthParams = new URLSearchParams({
        'client_id': 'd48e33355f30490aa2a952bbf70055ad',
        'redirect_uri': 'https://mikecoram.github.io/buy-music',
        'response_type': 'token',
        'state': Math.random().toString()
    })

    const spotifyAuthURL = `https://accounts.spotify.com/authorize?${spotifyAuthParams.toString()}`
    document.getElementById('login-with-spotify').setAttribute('href', spotifyAuthURL)
})
