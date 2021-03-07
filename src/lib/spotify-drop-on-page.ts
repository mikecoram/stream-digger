import { DroppedSpotifyItem } from './models/spotify-drop'
async function getSpotifyURIsFromDataTransferItem (i: DataTransferItem): Promise<string[]> {
  return await new Promise((resolve, reject) => {
    try {
      i.getAsString((list: string) => resolve(list.split('\n')))
    } catch (error) {
      reject(error)
    }
  })
}

async function getSpotifyURIsFromDropEvent (e: DragEvent): Promise<string[]> {
  if (e.dataTransfer === null) {
    throw new Error('null data transfer object')
  }

  for (const i of e.dataTransfer.items) {
    if (i.type === 'text/plain') {
      return await getSpotifyURIsFromDataTransferItem(i)
    }
  }

  throw new Error('no URIs item found')
}

export async function getItemsFromDropEvent (e: DragEvent): Promise<DroppedSpotifyItem[]> {
  const spotifyURIs = await getSpotifyURIsFromDropEvent(e)

  const spotifyObjects = spotifyURIs.map((u: string) => {
    const [type, id] = u.split('https://open.spotify.com/')[1].split('/')
    const item: DroppedSpotifyItem = { id, type }
    return item
  })

  return spotifyObjects
}
