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
      <tr className="releasesTable__row">
        <td className='releasesTable__column'>
          <img className='releasesTable__albumArtwork' src={smallImage?.url} alt={`${artists} - ${album.name} album artwork`} />
        </td>
        <td className='releasesTable__column releasesTable__artistsColumn'>
          {artists}
        </td>
        <td className='releasesTable__column releasesTable__albumColumn'>
          <div className='releasesTable__albumName'>
            {album.name}
          </div>

          <div className='releasesTable__albumLabel'>
            <span>on </span>

            <span className='releasesTable__albumLabel__label'>
              {album.label}
            </span>
          </div>
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
