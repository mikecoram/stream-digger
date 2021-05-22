import { SpotifyDrop } from './models/spotify-drop'
import { SpotifyItemType } from './models/spotify-item-type'

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
