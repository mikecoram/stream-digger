import { DroppedSpotifyItem } from './models/spotify-drop'

const key = 'spotifyItemReferences'

export class LocalStorageDroppedSpotifyItems {
  get (): DroppedSpotifyItem[] {
    const lsEntry = localStorage.getItem(key) ?? '[]'
    return JSON.parse(lsEntry) as DroppedSpotifyItem[]
  }

  append (items: DroppedSpotifyItem[]): void {
    const storedAndNewItems = this.get().concat(items)
    const dedupedItems: DroppedSpotifyItem[] = []

    for (const i of storedAndNewItems) {
      if (dedupedItems.some(di => di.id === i.id)) {
        continue
      }

      dedupedItems.push(i)
    }

    localStorage.setItem(key, JSON.stringify(dedupedItems))
  }

  clear (): void {
    localStorage.removeItem(key)
  }
}
