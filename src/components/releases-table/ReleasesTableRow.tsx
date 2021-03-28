import React from 'react'
import './ReleasesTable.css'
import { Merchant } from '../../lib/models/merchant'

interface Props {
  album: SpotifyApi.AlbumObjectFull
  merchants: Merchant[]
}

class ReleasesTableRow extends React.Component<Props> {
  render (): JSX.Element {
    const { album, merchants } = this.props
    const artists = album.artists.map(a => a.name).join(', ')

    return (
      <tr>
        <td className='releasesTable__column releasesTable__boughtColumn'>
          <input className='releasesTable__boughtCheckbox' type='checkbox' />
        </td>
        <td className='releasesTable__column releasesTable__artistsColumn'>
          {artists}
        </td>
        <td className='releasesTable__column releasesTable__albumColumn'>
          {album.name}
        </td>
        <td className='releasesTable__column'>
          {
            merchants.map(m =>
              <a
                key={`${album.id}-${m.id}`}
                href={encodeURI(`https://google.com/search?q=${m.search} ${artists} ${album.name}`)}
                className='releasesTable__merchantLink'
              >
                {m.text}
              </a>
            )
          }
        </td>
      </tr>
    )
  }
}

export default ReleasesTableRow
