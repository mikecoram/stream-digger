import React from 'react'
import './App.css'
import ReleasesTable from './releases-table/ReleasesTable'
import { merchants } from './lib/merchants'

interface Props {
  albums: SpotifyApi.AlbumObjectFull[]
}

class App extends React.Component<Props> {
  render (): JSX.Element {
    const { albums } = this.props

    return (
      <ReleasesTable albums={albums} merchants={merchants} />
    )
  }
}

export default App
