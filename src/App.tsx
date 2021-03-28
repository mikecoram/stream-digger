import React from 'react'
import './App.css'
import ReleasesTable from './releases-table/ReleasesTable'
import { merchants } from './lib/merchants'
import ClearAllBtn from './ClearAllBtn'
import DragPrompt from './DragPrompt'
import LogoutBtn from './LogoutBtn'

interface Props {
  albums: SpotifyApi.AlbumObjectFull[]
  onClearItems: () => void
  onLogout: () => void
}

class App extends React.Component<Props> {
  render (): JSX.Element {
    const { albums } = this.props

    const buttons = (
      <div className="buttonContainer">
        {
          albums.length > 0 ? 
            <ClearAllBtn onClearItems={this.props.onClearItems.bind(this)} /> 
            : null
        }
        <LogoutBtn onLogout={this.props.onLogout.bind(this)} />
      </div>
    )

    const content = (
      albums.length === 0 ? <DragPrompt /> : <ReleasesTable albums={albums} merchants={merchants} />
    )

    return (
      <div className='app'>
        {buttons}
        {content}
      </div>
    )
  }
}

export default App
