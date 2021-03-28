import SpotifyWebApi from 'spotify-web-api-js'
import { DroppedSpotifyItem } from './models/spotify-drop'

async function resolveTrackIds (
  api: SpotifyWebApi.SpotifyWebApiJs,
  trackIds: string[]
): Promise<SpotifyApi.AlbumObjectFull[]> {
  const albums: SpotifyApi.AlbumObjectFull[] = []

  if (trackIds.length > 0) {
    let i = 0; let trackIdsChunk

    while ((trackIdsChunk = trackIds.slice(i, i + 50)).length > 0) {
      const res = await api.getTracks(trackIdsChunk)
      albums.push(...res.tracks.map(i => i.album as SpotifyApi.AlbumObjectFull))
      i += 50
    }
  }

  return albums
}

async function resolvePlaylistIds (
  api: SpotifyWebApi.SpotifyWebApiJs,
  playlistIds: string[]
): Promise<SpotifyApi.AlbumObjectFull[]> {
  const albums: SpotifyApi.AlbumObjectFull[] = []

  for (const i of playlistIds) {
    let offset = 0
    let res = await api.getPlaylistTracks(i, { offset, limit: 50 })
    albums.push(...res.items.map(i => (i.track as SpotifyApi.TrackObjectFull).album as SpotifyApi.AlbumObjectFull))

    while (res.next !== null) {
      res = await api.getPlaylistTracks(i, { offset: offset += 50, limit: 50 })
      albums.push(...res.items.map(i => (i.track as SpotifyApi.TrackObjectFull).album as SpotifyApi.AlbumObjectFull))
    }
  }

  return albums
}

async function resolveAlbumIds (
  api: SpotifyWebApi.SpotifyWebApiJs,
  albumIds: string[]
): Promise<SpotifyApi.AlbumObjectFull[]> {
  const albums: SpotifyApi.AlbumObjectFull[] = []

  if (albumIds.length > 0) {
    let i = 0; let albumIdsChunk

    while ((albumIdsChunk = albumIds.slice(i, i + 20)).length > 0) {
      const res = await api.getAlbums(albumIdsChunk)
      albums.push(...res.albums)
      i += 20
    }
  }

  return albums
}

async function resolveArtistIds (
  api: SpotifyWebApi.SpotifyWebApiJs,
  artistIds: string[]
): Promise<SpotifyApi.AlbumObjectFull[]> {
  const albums: SpotifyApi.AlbumObjectFull[] = []

  for (const i of artistIds) {
    let offset = 0
    let res = await api.getArtistAlbums(i, { offset, limit: 50 })
    albums.push(...(res.items as SpotifyApi.AlbumObjectFull[]))
    offset += 50

    while (res.next !== null) {
      res = await api.getArtistAlbums(i, { offset: offset += 50, limit: 50 })
      albums.push(...(res.items as SpotifyApi.AlbumObjectFull[]))
    }
  }

  return albums
}

export const resolveDroppedItems = async (
  api: SpotifyWebApi.SpotifyWebApiJs,
  items: DroppedSpotifyItem[]
): Promise<SpotifyApi.AlbumObjectFull[]> => {
  const trackIds = items.filter(i => i.type === 'track').map(i => i.id)
  const playlistIds = items.filter(i => i.type === 'playlist').map(i => i.id)
  const albumIds = items.filter(i => i.type === 'album').map(i => i.id)
  const artistIds = items.filter(i => i.type === 'artist').map(i => i.id)

  const albums: SpotifyApi.AlbumObjectFull[] = [
    ...await resolveTrackIds(api, trackIds),
    ...await resolvePlaylistIds(api, playlistIds),
    ...await resolveAlbumIds(api, albumIds),
    ...await resolveArtistIds(api, artistIds)
  ]

  const dedupedAlbums: SpotifyApi.AlbumObjectFull[] = []

  for (const i of albums) {
    if (dedupedAlbums.some(a => a.id === i.id)) {
      continue
    }

    dedupedAlbums.push(i)
  }

  return dedupedAlbums
}
