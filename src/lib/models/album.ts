export interface Album extends SpotifyApi.AlbumObjectFull {
  label: string
  bought?: boolean
}
