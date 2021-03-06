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
