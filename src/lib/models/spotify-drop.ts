export type DroppedSpotifyItemType = 'track'|'album'|'artist'|'playlist'

export interface DroppedSpotifyItem {
  id: string
  type: DroppedSpotifyItemType
}
