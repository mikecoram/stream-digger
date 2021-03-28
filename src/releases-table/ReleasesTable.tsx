import React from 'react'
import './ReleasesTable.css'
import { Merchant } from '../lib/models/merchant'
import ReleasesTableRow from './ReleasesTableRow'

interface Props {
  albums: SpotifyApi.AlbumObjectFull[]
  merchants: Merchant[]
}

class ReleasesTable extends React.Component<Props> {
  render (): JSX.Element {
    const { albums, merchants } = this.props

    const rows = albums.map(a =>
      <ReleasesTableRow
        key={a.id}
        album={a}
        merchants={merchants}
      />
    )

    return (
      <table className='releasesTable'>
        <thead className='releasesTable__head'>
          <tr>
            <td className='releasesTable__headColumn'>
              Bought?
            </td>
            <td className='releasesTable__headColumn'>
              Release
            </td>
            <td className='releasesTable__headColumn'>
              Find on merchants
            </td>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    )
  }
}

export default ReleasesTable
