import React from 'react'
import './ReleasesTable.css'
import { Merchant } from '../../lib/models/merchant'
import { Album } from '../../lib/models/album'

interface Props {
  album: Album
  merchants: Merchant[]
}

class ReleasesTableRow extends React.Component<Props> {
  render (): JSX.Element {
    const { album, merchants } = this.props
    const artists = album.artists.map(a => a.name).join(', ')
    const smallImage = album.images.find(i => i.height === 64)

    return (
      <tr>
        <td className='releasesTable__column'>
          <img src={smallImage?.url} />
        </td>
        <td className='releasesTable__column releasesTable__artistsColumn'>
          {artists}
        </td>
        <td className='releasesTable__column releasesTable__albumColumn'>
          {album.name}
        </td>
        <td className='releasesTable__column releasesTable__labelColumn'>
          {album.label}
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
        <td className='releasesTable__column releasesTable__boughtColumn'>
          <input className='releasesTable__boughtCheckbox' type='checkbox' />
        </td>
      </tr>
    )
  }
}

export default ReleasesTableRow
