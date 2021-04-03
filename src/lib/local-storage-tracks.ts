import { Track } from './models/track'

const key = 'spotifyTracks'

export class LocalStorageTracks {
  get (): Track[] {
    const lsEntry = localStorage.getItem(key) ?? '[]'
    return JSON.parse(lsEntry) as Track[]
  }

  set (tracks: Track[]): void {
    localStorage.setItem(key, JSON.stringify(tracks))
  }

  setOne (track: Track): void {
    const tracks = this.get()
    Object.assign(tracks.find(a => a.id === track.id), track)
    this.set(tracks)
  }

  append (tracks: Track[]): void {
    const lsEntry = localStorage.getItem(key) ?? '[]'
    const storedTracks = JSON.parse(lsEntry) as Track[]
    localStorage.setItem(key, JSON.stringify(storedTracks.concat(tracks)))
  }

  idDifference (trackIds: string[]): string[] {
    const presentTrackIds = this.get().map(a => a.id)
    return trackIds.filter(a => !presentTrackIds.includes(a))
  }

  clear (): void {
    localStorage.removeItem(key)
  }
}
