import { Album } from './models/album'
import { DroppedSpotifyItem } from './models/spotify-drop'
import { SpotifyResolver } from './spotify-resolver'

function removeDuplicates (
  albumsWithDuplicates: Album[]
): Album[] {
  const dedupedAlbums: Album[] = []

  for (const i of albumsWithDuplicates) {
    if (dedupedAlbums.some(a => a.id === i.id)) {
      continue
    }

    dedupedAlbums.push(i)
  }

  return dedupedAlbums
}

export const droppedItemsToAlbums = async (
  spotify: SpotifyResolver,
  items: DroppedSpotifyItem[]
): Promise<Album[]> => {
  const trackIds = items.filter(i => i.type === 'track').map(i => i.id)
  const playlistIds = items.filter(i => i.type === 'playlist').map(i => i.id)
  const albumIds = items.filter(i => i.type === 'album').map(i => i.id)

  return removeDuplicates([
    ...await spotify.tracksToAlbums(trackIds),
    ...await spotify.playlistsToAlbums(playlistIds),
    ...await spotify.albumsToAlbums(albumIds)
  ])
}
