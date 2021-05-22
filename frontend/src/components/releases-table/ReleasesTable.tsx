import React from 'react'
import './ReleasesTable.css'
import { Merchant } from '../../lib/models/merchant'
import ReleasesTableRow from './ReleasesTableRow'
import { Album } from '../../lib/models/album'
import { Track } from '../../lib/models/track'

interface Props {
  albums: Album[]
  importedTracks: Track[]
  merchants: Merchant[]
  onChangeAlbum: (album: Album) => void
  onClickImportedTracksMoreInfo: (tracks: Track[]) => void
}

class ReleasesTable extends React.Component<Props> {
  render (): JSX.Element {
    const { albums, importedTracks, merchants } = this.props

    const rows = albums.map(a =>
      <ReleasesTableRow
        key={a.id}
        album={a}
        tracks={importedTracks.filter(t => t.album.id === a.id)}
        merchants={merchants}
        onChangeAlbum={this.props.onChangeAlbum}
        onClickImportedTracksMoreInfo={this.props.onClickImportedTracksMoreInfo}
      />
    )

    return (
      <table className='releasesTable' cellSpacing='0' cellPadding='0'>
        <thead className='releasesTable__head'>
          <tr>
            <th className='releasesTable__headColumn releasesTable__headColumn__artwork' />
            <th className='releasesTable__headColumn'>
              Artists
            </th>
            <th className='releasesTable__headColumn'>
              Release
            </th>
            <th className='releasesTable__headColumn'>
              Imported tracks
            </th>
            <th className='releasesTable__headColumn'>
              Find on
            </th>
            <th className='releasesTable__headColumn'>
              Bought
            </th>
          </tr>
        </thead>
        <tbody className='releasesTable__tbody'>
          {rows}
        </tbody>
      </table>
    )
  }
}

export default ReleasesTable
