import { DroppedSpotifyItem, DroppedSpotifyItemType } from './models/spotify-drop'
async function getURIsFromDataTransferItem (i: DataTransferItem): Promise<string[]> {
  return await new Promise((resolve, reject) => {
    try {
      i.getAsString((list: string) => resolve(list.split('\n')))
    } catch (error) {
      reject(error)
    }
  })
}

async function getURIsFromDropEvent (e: DragEvent): Promise<string[]> {
  if (e.dataTransfer === null) {
    throw new Error('null data transfer object')
  }

  for (const i of e.dataTransfer.items) {
    if (i.type === 'text/plain') {
      return await getURIsFromDataTransferItem(i)
    }
  }

  throw new Error('no URIs item found')
}

export async function getItemsFromDropEvent (e: DragEvent): Promise<DroppedSpotifyItem[]> {
  const spotifyURIs = await getURIsFromDropEvent(e)

  const spotifyObjects = spotifyURIs
    .filter((u: string) => u.includes('https://open.spotify.com'))
    .map((u: string) => {
      if (u.includes('playlist')) {
        return {
          id: u.split('playlist/')[1],
          type: 'playlist' as DroppedSpotifyItemType
        }
      }

      const [type, id] = u.split('https://open.spotify.com/')[1].split('/')

      return {
        id,
        type: type as DroppedSpotifyItemType
      }
    })

  return spotifyObjects
}
