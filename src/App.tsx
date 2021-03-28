import React from 'react'
import './App.css'
import { merchants } from './lib/merchants'

interface Props {
  albums: SpotifyApi.AlbumObjectFull[]
}

class App extends React.Component<Props> {
  render (): JSX.Element {
    const { albums } = this.props

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
          {
            albums.map(a => {
              const album = `${a.artists.map(a => a.name).join(', ')} ${a.name}`

              return (
                <tr key={a.id}>
                  <td className='releasesTable__column releasesTable__boughtColumn'>
                    <input className='releasesTable__boughtCheckbox' type='checkbox' />
                  </td>
                  <td className='releasesTable__column releasesTable__albumColumn'>
                    {album}
                  </td>
                  <td className='releasesTable__column'>
                    {
                      merchants.map(m =>
                        <a
                          key={`${a.id}-${m.id}`}
                          href={encodeURI(`https://google.com/search?q=${m.search} ${album}`)}
                          className='releasesTable__merchantLink'
                        >
                          {m.text}
                        </a>
                      )
                    }
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    )
  }
}

export default App
