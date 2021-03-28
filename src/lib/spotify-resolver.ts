import SpotifyWebApi from 'spotify-web-api-js'

export class SpotifyResolver {
  api: SpotifyWebApi.SpotifyWebApiJs

  constructor (api: SpotifyWebApi.SpotifyWebApiJs) {
    this.api = api
  }

  async tracksToAlbums (
    trackIds: string[]
  ): Promise<SpotifyApi.AlbumObjectFull[]> {
    const albums: SpotifyApi.AlbumObjectFull[] = []

    if (trackIds.length > 0) {
      let i = 0; let trackIdsChunk

      while ((trackIdsChunk = trackIds.slice(i, i + 50)).length > 0) {
        const res = await this.api.getTracks(trackIdsChunk)
        albums.push(...res.tracks.map(i => i.album as SpotifyApi.AlbumObjectFull))
        i += 50
      }
    }

    return albums
  }

  async playlistsToAlbums (
    playlistIds: string[]
  ): Promise<SpotifyApi.AlbumObjectFull[]> {
    const albums: SpotifyApi.AlbumObjectFull[] = []

    for (const i of playlistIds) {
      let offset = 0
      let res = await this.api.getPlaylistTracks(i, { offset, limit: 50 })
      albums.push(...res.items.map(i => (i.track as SpotifyApi.TrackObjectFull).album as SpotifyApi.AlbumObjectFull))

      while (res.next !== null) {
        res = await this.api.getPlaylistTracks(i, { offset: offset += 50, limit: 50 })
        albums.push(...res.items.map(i => (i.track as SpotifyApi.TrackObjectFull).album as SpotifyApi.AlbumObjectFull))
      }
    }

    return albums
  }

  async albumsToAlbums (
    albumIds: string[]
  ): Promise<SpotifyApi.AlbumObjectFull[]> {
    const albums: SpotifyApi.AlbumObjectFull[] = []

    if (albumIds.length > 0) {
      let i = 0; let albumIdsChunk

      while ((albumIdsChunk = albumIds.slice(i, i + 20)).length > 0) {
        const res = await this.api.getAlbums(albumIdsChunk)
        albums.push(...res.albums)
        i += 20
      }
    }

    return albums
  }

  async artistsToAlbums (
    artistIds: string[]
  ): Promise<SpotifyApi.AlbumObjectFull[]> {
    const albums: SpotifyApi.AlbumObjectFull[] = []

    for (const i of artistIds) {
      let offset = 0
      let res = await this.api.getArtistAlbums(i, { offset, limit: 50 })
      albums.push(...(res.items as SpotifyApi.AlbumObjectFull[]))
      offset += 50

      while (res.next !== null) {
        res = await this.api.getArtistAlbums(i, { offset: offset += 50, limit: 50 })
        albums.push(...(res.items as SpotifyApi.AlbumObjectFull[]))
      }
    }

    return albums
  }
}
