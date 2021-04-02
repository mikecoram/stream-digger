import { Album } from './models/album'

const key = 'spotifyAlbums'

export class LocalStorageAlbums {
  get (): Album[] {
    const lsEntry = localStorage.getItem(key) ?? '[]'
    return JSON.parse(lsEntry) as Album[]
  }

  set (albums: Album[]): void {
    localStorage.setItem(key, JSON.stringify(albums))
  }

  append (albums: Album[]): void {
    const lsEntry = localStorage.getItem(key) ?? '[]'
    const storedAlbums = JSON.parse(lsEntry) as Album[]
    localStorage.setItem(key, JSON.stringify(storedAlbums.concat(albums)))
  }

  idDifference (albumIds: string[]): string[] {
    const presentAlbumIds = this.get().map(a => a.id)
    return albumIds.filter(a => !presentAlbumIds.includes(a))
  }
}
