import { Album } from './models/album'
import { SpotifyDrop } from './models/spotify-drop'
import { SpotifyResolver } from './spotify-resolver'
import { Track } from './models/track'

export const albumsIdsToAlbums = async (
  spotify: SpotifyResolver,
  albumIds: string[]
): Promise<Album[]> => {
  return await spotify.albumsToAlbums(albumIds)
}

export const trackIdsToTracks = async (
  spotify: SpotifyResolver,
  trackIds: string[]
): Promise<Track[]> => {
  return await spotify.tracksToTracks(trackIds)
}

export const dropsToTracks = async (
  spotify: SpotifyResolver,
  drops: SpotifyDrop[]
): Promise<SpotifyApi.TrackObjectFull[]> => {
  const ids = await dropsToTrackIds(spotify, drops)
  return await trackIdsToTracks(spotify, ids)
}

export const dropsToTrackIds = async (
  spotify: SpotifyResolver,
  drops: SpotifyDrop[]
): Promise<string[]> => {
  const trackIds = drops.filter(i => i.type === 'track').map(i => i.id)
  const playlistIds = drops.filter(i => i.type === 'playlist').map(i => i.id)
  const albumIds = drops.filter(i => i.type === 'album').map(i => i.id)

  return [...new Set([
    ...trackIds,
    ...await spotify.playlistsToTrackIds(playlistIds),
    ...await spotify.albumsToTrackIds(albumIds)
  ]).values()]
}

export const dropsToAlbumIds = async (
  spotify: SpotifyResolver,
  drops: SpotifyDrop[]
): Promise<string[]> => {
  const trackIds = drops.filter(i => i.type === 'track').map(i => i.id)
  const playlistIds = drops.filter(i => i.type === 'playlist').map(i => i.id)
  const albumIds = drops.filter(i => i.type === 'album').map(i => i.id)

  return [...new Set([
    ...await spotify.tracksToAlbumIds(trackIds),
    ...await spotify.playlistsToAlbumIds(playlistIds),
    ...albumIds
  ]).values()]
}