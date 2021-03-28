import React from 'react'
import './ReleasesTable.css'
import { Merchant } from '../lib/models/merchant'

interface Props {
  album: SpotifyApi.AlbumObjectFull
  merchants: Merchant[]
}

class ReleasesTableRow extends React.Component<Props> {
  render (): JSX.Element {
    const { album, merchants } = this.props
    const text = `${album.artists.map(a => a.name).join(', ')} ${album.name}`

    return (
      <tr>
        <td className='releasesTable__column releasesTable__boughtColumn'>
          <input className='releasesTable__boughtCheckbox' type='checkbox' />
        </td>
        <td className='releasesTable__column releasesTable__albumColumn'>
          {text}
        </td>
        <td className='releasesTable__column'>
          {
            merchants.map(m =>
              <a
                key={`${album.id}-${m.id}`}
                href={encodeURI(`https://google.com/search?q=${m.search} ${text}`)}
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
