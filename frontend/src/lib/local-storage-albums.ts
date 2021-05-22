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

  setOne (album: Album): void {
    const albums = this.get()
    Object.assign(albums.find(a => a.id === album.id), album)
    this.set(albums)
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

  clear (): void {
    localStorage.removeItem(key)
  }
}
