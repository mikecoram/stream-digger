import { Track } from './track'

export interface Album extends SpotifyApi.AlbumObjectFull {
  label: string
  bought: boolean
  importedTracks: Track[]
}
