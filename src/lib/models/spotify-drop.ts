import { SpotifyItemType } from './spotify-item-type'

export interface SpotifyDrop {
  id: string
  type: SpotifyItemType
  resolved: boolean
}
