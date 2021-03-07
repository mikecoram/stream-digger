import { DroppedSpotifyItem } from './models/spotify-drop';
const localStorageKey = 'spotifyItemReferences'

export class LocalStorageDroppedSpotifyItems {
  get() : DroppedSpotifyItem[] {
    const item = localStorage.getItem(localStorageKey)

    if (item === null) {
      return []
    }

    return JSON.parse(item) as DroppedSpotifyItem[]
  }

  append(items: DroppedSpotifyItem[]) : void {
    const storedAndNewItems = this.get().concat(items)
    const dedupedItems: DroppedSpotifyItem[] = []

    for (const i of storedAndNewItems) {
      if (dedupedItems.some(di => di.id === i.id)) {
        continue
      }

      dedupedItems.push(i)
    }

    localStorage.setItem(localStorageKey, JSON.stringify(dedupedItems))
  }
}