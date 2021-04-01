import React from 'react'
import './ReleasesTable.css'
import { Merchant } from '../../lib/models/merchant'
import ReleasesTableRow from './ReleasesTableRow'
import { Album } from '../../lib/models/album'

interface Props {
  albums: Album[]
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
      <table className='releasesTable' cellSpacing="0" cellPadding="0">
        <thead className='releasesTable__head'>
          <tr>
            <td className='releasesTable__headColumn releasesTable__headColumn__artwork' />
            <td className='releasesTable__headColumn'>
              Artists
            </td>
            <td className='releasesTable__headColumn'>
              Release
            </td>
            <td className='releasesTable__headColumn'>
              Buy from
            </td>
            <td className='releasesTable__headColumn'>
              Bought
            </td>
          </tr>
        </thead>
        <tbody className="releasesTable__tbody">
          {rows}
        </tbody>
      </table>
    )
  }
}

export default ReleasesTable
