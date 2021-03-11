import SpotifyWebApi from 'spotify-web-api-js'
import { DroppedSpotifyItem } from './models/spotify-drop'

export const resolveDroppedItems = async (
  api: SpotifyWebApi.SpotifyWebApiJs,
  items: DroppedSpotifyItem[]
): Promise<SpotifyApi.AlbumObjectFull[]> => {
  let albums: SpotifyApi.AlbumObjectFull[] = []
  const trackIds = items.filter(i => i.type === 'track').map(i => i.id)
  const playlistIds = items.filter(i => i.type === 'playlist').map(i => i.id)
  const albumIds = items.filter(i => i.type === 'album').map(i => i.id)
  const artistIds = items.filter(i => i.type === 'artist').map(i => i.id)

  if (trackIds.length > 0) {
    let i = 0; let trackIdsChunk

    while ((trackIdsChunk = trackIds.slice(i, i + 50)).length > 0) {
      const res = await api.getTracks(trackIdsChunk)
      albums = albums.concat(res.tracks.map(i => i.album as SpotifyApi.AlbumObjectFull))
      i += 50
    }
  }

  for (const i of playlistIds) {
    let offset = 0; let res

    while ((res = await api.getPlaylistTracks(i, { offset, limit: 50 })).next !== null) {
      albums = albums.concat(res.items.map(i => (i as any).track.album))
      offset += 50
    }
  }

  if (albumIds.length > 0) {
    let i = 0; let albumIdsChunk

    while ((albumIdsChunk = albumIds.slice(i, i + 20)).length > 0) {
      const res = await api.getAlbums(albumIdsChunk)
      albums = albums.concat(res.albums)
      i += 20
    }
  }

  for (const i of artistIds) {
    let offset = 0; let res

    while ((res = await api.getArtistAlbums(i, { offset, limit: 50 })).next !== null) {
      albums = albums.concat(res.items as any)
      offset += 50
    }
  }

  const dedupedAlbums: SpotifyApi.AlbumObjectFull[] = []

  for (const i of albums) {
    if (dedupedAlbums.some(a => a.id === i.id)) {
      continue
    }

    dedupedAlbums.push(i)
  }

  return dedupedAlbums
}
