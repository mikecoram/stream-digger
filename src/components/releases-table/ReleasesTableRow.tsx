import React from 'react'
import './ReleasesTable.css'
import { Merchant } from '../../lib/models/merchant'
import { Album } from '../../lib/models/album'

interface Props {
  album: Album
  merchants: Merchant[]
  onChangeAlbum: (album: Album) => void
}

class ReleasesTableRow extends React.Component<Props> {
  render (): JSX.Element {
    const { album, merchants } = this.props
    const artists = album.artists.map(a => a.name).join(', ')
    const smallImage = album.images.find(i => i.height === 64)

    return (
      <tr className='releasesTable__row'>
        <td className='releasesTable__column'>
          <img
            className='releasesTable__albumArtwork'
            src={smallImage?.url} alt={`${artists} - ${album.name} album artwork`}
          />
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
                className='releasesTable__merchantLink'
                href={encodeURI(`https://google.com/search?q=${m.search} ${artists} ${album.name}`)}
                key={`${album.id}-${m.id}`}
                rel='noreferrer'
                target='_blank'
              >
                {m.text}
              </a>
            )
          }
        </td>
        <td className='releasesTable__column releasesTable__boughtColumn'>
          <input
            className='releasesTable__boughtCheckbox'
            onChange={(e) => this.props.onChangeAlbum({ ...album, bought: e.target.checked })}
            type='checkbox'
            checked={album.bought ?? false}
          />
        </td>
      </tr>
    )
  }
}

export default ReleasesTableRow
