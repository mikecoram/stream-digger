import { DroppedSpotifyItem, DroppedSpotifyItemType } from './models/spotify-drop'

async function getURIsFromDataTransferItem (i: DataTransferItem): Promise<string[]> {
  return await new Promise((resolve, reject) => {
    try {
      i.getAsString((list: string) => {
        resolve(list.split('\n'))
      })
    } catch (error) {
      reject(error)
    }
  })
}

export async function getPlainTextURIsFromDropEventData (data: DataTransfer): Promise<string[]> {
  for (const i of data.items) {
    if (i.type === 'text/plain') {
      return await getURIsFromDataTransferItem(i)
    }
  }

  throw new Error('no URIs item found')
}

export async function getItemsFromDropEvent (e: DragEvent): Promise<DroppedSpotifyItem[]> {
  if (e.dataTransfer === null) {
    throw new Error('null data transfer object')
  }

  const spotifyURIs = await getPlainTextURIsFromDropEventData(e.dataTransfer)

  const spotifyObjects = spotifyURIs
    .filter((u: string) => {
      return u.includes('https://open.spotify.com/track/') ||
        u.includes("https://open.spotify.com/album/") ||
        u.includes("https://open.spotify.com/playlist/")
    })
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
