import { SpotifyDrop } from './models/spotify-drop'
import { SpotifyItemType } from './models/spotify-item-type'

const getURIsFromDataTransferItem = async (i: DataTransferItem): Promise<string[]> =>
  await new Promise((resolve, reject) => {
    try {
      i.getAsString((list: string) => {
        resolve(list.split('\n'))
      })
    } catch (error) {
      reject(error)
    }
  })

export async function getPlainTextURIsFromDropEventData (data: DataTransfer): Promise<string[]> {
  for (const i of data.items) {
    if (i.type === 'text/plain') {
      return await getURIsFromDataTransferItem(i)
    }
  }

  throw new Error('no URIs item found')
}

export const onlySpotifyURIs = (URIs: string[]): string[] =>
  URIs.filter((u: string) =>
    u.includes('https://open.spotify.com/track/') ||
    u.includes('https://open.spotify.com/album/') ||
    u.includes('https://open.spotify.com/playlist/') ||
    /https:\/\/open\.spotify\.com\/user\/.*\/playlist\/.*/.test(u)
  )

export const getDropsFromURIs = (spotifyURIs: string[]): SpotifyDrop[] => {
  return spotifyURIs.map((u: string) => {
    if (u.includes('playlist')) {
      return {
        id: u.split('playlist/')[1],
        type: 'playlist' as SpotifyItemType,
        resolved: false
      }
    }

    const [type, id] = u.split('https://open.spotify.com/')[1].split('/')

    return {
      id,
      type: type as SpotifyItemType,
      resolved: false
    }
  })
}
