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
      <>
        {
          albums.map(a => {
            const albumTerm = `${a.artists.map(a => a.name).join(', ')} ${a.name}`

            return (
              <li key={a.id}>
                <input type='checkbox' />
                {albumTerm}
                <span> </span>
                {
                  merchants.map(m =>
                    <React.Fragment key={`${a.id}-${m.id}`}>
                      <a href={encodeURI(`https://google.com/search?q=${m.search} ${albumTerm}`)}>
                        {m.text}
                      </a>
                      <span> </span>
                    </React.Fragment>
                  )
                }
              </li>
            )
          })
        }
      </>
    )
  }
}

export default App
