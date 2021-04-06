import { SpotifyDrop } from './models/spotify-drop'

const key = 'spotifyItemReferences'

export class LocalStorageDrops {
  get (): SpotifyDrop[] {
    const lsEntry = localStorage.getItem(key) ?? '[]'
    return JSON.parse(lsEntry) as SpotifyDrop[]
  }

  append (drops: SpotifyDrop[]): void {
    const storedAndNewDrops = this.get().concat(drops)
    const dedupedDrops: SpotifyDrop[] = []

    for (const i of storedAndNewDrops) {
      if (dedupedDrops.some(di => di.id === i.id)) {
        continue
      }

      dedupedDrops.push(i)
    }

    localStorage.setItem(key, JSON.stringify(dedupedDrops))
  }

  clear (): void {
    localStorage.removeItem(key)
  }
}
