import SpotifyWebApi from 'spotify-web-api-js'
import { Album } from './models/album'
import { Track } from './models/track'

export class SpotifyResolver {
  api: SpotifyWebApi.SpotifyWebApiJs

  constructor (api: SpotifyWebApi.SpotifyWebApiJs) {
    this.api = api
  }

  async tracksToAlbumIds (
    trackIds: string[]
  ): Promise<string[]> {
    const albumIds: string[] = []

    if (trackIds.length > 0) {
      let i = 0; let trackIdsChunk

      while ((trackIdsChunk = trackIds.slice(i, i + 50)).length > 0) {
        const res = await this.api.getTracks(trackIdsChunk)
        albumIds.push(...res.tracks.map(i => i.album.id))
        i += 50
      }
    }

    return albumIds
  }

  async tracksToTracks (
    trackIds: string[]
  ): Promise<Track[]> {
    const tracks: Track[] = []

    if (trackIds.length > 0) {
      let i = 0; let trackIdsChunk

      while ((trackIdsChunk = trackIds.slice(i, i + 50)).length > 0) {
        const res = await this.api.getTracks(trackIdsChunk)
        tracks.push(...(res.tracks as Track[]))
        i += 50
      }
    }

    return tracks
  }

  async tracksToAlbums (
    trackIds: string[]
  ): Promise<Album[]> {
    const albumIds = await this.tracksToAlbumIds(trackIds)
    return await this.albumsToAlbums(albumIds)
  }

  async playlistsToTrackIds (
    playlistIds: string[]
  ): Promise<string[]> {
    const trackIds: string[] = []

    for (const i of playlistIds) {
      let offset = 0
      let res = await this.api.getPlaylistTracks(i, { offset, limit: 50 })
      trackIds.push(...res.items.map(i => i.track.id))

      while (res.next !== null) {
        res = await this.api.getPlaylistTracks(i, { offset: offset += 50, limit: 50 })
        trackIds.push(...res.items.map(i => i.track.id))
      }
    }

    return trackIds
  }

  async playlistsToAlbumIds (
    playlistIds: string[]
  ): Promise<string[]> {
    const albumIds: string[] = []

    for (const i of playlistIds) {
      let offset = 0
      let res = await this.api.getPlaylistTracks(i, { offset, limit: 50 })

      // eslint-disable-next-line no-loop-func
      albumIds.push(...res.items.map(i => (i.track as SpotifyApi.TrackObjectFull).album.id))

      while (res.next !== null) {
        res = await this.api.getPlaylistTracks(i, { offset: offset += 50, limit: 50 })

        // eslint-disable-next-line no-loop-func
        albumIds.push(...res.items.map(i => (i.track as SpotifyApi.TrackObjectFull).album.id))
      }
    }

    return albumIds
  }

  async playlistsToAlbums (
    playlistIds: string[]
  ): Promise<Album[]> {
    const albumIds = await this.playlistsToAlbumIds(playlistIds)
    return await this.albumsToAlbums(albumIds)
  }

  async albumsToAlbums (
    albumIds: string[]
  ): Promise<Album[]> {
    const albums: Album[] = []

    if (albumIds.length > 0) {
      let i = 0; let albumIdsChunk

      while ((albumIdsChunk = albumIds.slice(i, i + 20)).length > 0) {
        const res = await this.api.getAlbums(albumIdsChunk)
        albums.push(...res.albums as Album[])
        i += 20
      }
    }

    return albums
  }

  async albumsToTrackIds (
    albumIds: string[]
  ): Promise<string[]> {
    const trackIds: string[] = []

    if (albumIds.length > 0) {
      let i = 0; let albumIdsChunk

      while ((albumIdsChunk = albumIds.slice(i, i + 20)).length > 0) {
        const res = await this.api.getAlbums(albumIdsChunk)
        res.albums.forEach(a => trackIds.push(...a.tracks.items.map(i => i.id)))
        i += 20
      }
    }

    return trackIds
  }
}
