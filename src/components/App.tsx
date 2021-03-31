import React from 'react'
import './App.css'
import ReleasesTable from './releases-table/ReleasesTable'
import { merchants } from '../lib/merchants'
import ClearAllBtn from './ClearAllBtn'
import DragPrompt from './DragPrompt'
import LogoutBtn from './LogoutBtn'
import Header from './Header'
import Footer from './Footer'
import { Login } from './Login'
import DragoverPrompt from './DragoverPrompt'
import { Album } from '../lib/models/album'

interface Props {
  albums: Album[]
  isLoggedIn: boolean
  isDragging: boolean
  onClearItems: () => void
  onLogout: () => void
}

class App extends React.Component<Props> {
  buttons (showClearAll: boolean): JSX.Element {
    return (
      <div className='buttonContainer'>
        {
          showClearAll
            ? <ClearAllBtn onClearItems={this.props.onClearItems.bind(this)} />
            : null
        }
        <LogoutBtn onLogout={this.props.onLogout.bind(this)} />
      </div>
    )
  }

  content (): JSX.Element {
    const { albums, isDragging, isLoggedIn } = this.props

    if (!isLoggedIn) {
      return <Login />
    }

    if (isDragging) {
      return <DragoverPrompt />
    }

    if (albums.length === 0) {
      return <DragPrompt />
    }

    return <ReleasesTable albums={albums} merchants={merchants} />
  }

  render (): JSX.Element {
    const { albums } = this.props

    return (
      <div className='app'>
        <Header buttons={this.buttons(albums.length > 0)} />
        <div className='content'>
          {this.content()}
        </div>
        <Footer />
      </div>
    )
  }
}

export default App
