import { Album } from './models/album'
import { DroppedSpotifyItem } from './models/spotify-drop'
import { SpotifyResolver } from './spotify-resolver'
import { Track } from './models/track';

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

export const droppedItemsToTracks = async (
  spotify: SpotifyResolver,
  items: DroppedSpotifyItem[]
): Promise<SpotifyApi.TrackObjectFull[]> => {
  const ids = await droppedItemsToTrackIds(spotify, items)
  return await trackIdsToTracks(spotify, ids)
}

export const droppedItemsToTrackIds = async (
  spotify: SpotifyResolver,
  items: DroppedSpotifyItem[]
): Promise<string[]> => {
  const trackIds = items.filter(i => i.type === 'track').map(i => i.id)
  const playlistIds = items.filter(i => i.type === 'playlist').map(i => i.id)
  const albumIds = items.filter(i => i.type === 'album').map(i => i.id)

  return [...new Set([
    ...trackIds,
    ...await spotify.playlistsToTrackIds(playlistIds),
    ...await spotify.albumsToTrackIds(albumIds)
  ]).values()]
}

export const droppedItemsToAlbumIds = async (
  spotify: SpotifyResolver,
  items: DroppedSpotifyItem[]
): Promise<string[]> => {
  const trackIds = items.filter(i => i.type === 'track').map(i => i.id)
  const playlistIds = items.filter(i => i.type === 'playlist').map(i => i.id)
  const albumIds = items.filter(i => i.type === 'album').map(i => i.id)

  return [...new Set([
    ...await spotify.tracksToAlbumIds(trackIds),
    ...await spotify.playlistsToAlbumIds(playlistIds),
    ...albumIds
  ]).values()]
}
