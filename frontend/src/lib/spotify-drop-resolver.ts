import { SpotifyDrop } from './models/spotify-drop'
import { SpotifyResolver } from './spotify-resolver'

export class SpotifyDropResolver {
  spotify: SpotifyResolver

  constructor (
    spotify: SpotifyResolver
  ) {
    this.spotify = spotify
  }

  async dropsToTrackIds (
    drops: SpotifyDrop[]
  ): Promise<string[]> {
    const trackIds = drops.filter(i => i.type === 'track').map(i => i.id)
    const playlistIds = drops.filter(i => i.type === 'playlist').map(i => i.id)
    const albumIds = drops.filter(i => i.type === 'album').map(i => i.id)

    return [...new Set([
      ...trackIds,
      ...await this.spotify.playlistsToTrackIds(playlistIds),
      ...await this.spotify.albumsToTrackIds(albumIds)
    ]).values()]
  }

  async dropsToAlbumIds (
    drops: SpotifyDrop[]
  ): Promise<string[]> {
    const trackIds = drops.filter(i => i.type === 'track').map(i => i.id)
    const playlistIds = drops.filter(i => i.type === 'playlist').map(i => i.id)
    const albumIds = drops.filter(i => i.type === 'album').map(i => i.id)

    return [...new Set([
      ...await this.spotify.tracksToAlbumIds(trackIds),
      ...await this.spotify.playlistsToAlbumIds(playlistIds),
      ...albumIds
    ]).values()]
  }
}
