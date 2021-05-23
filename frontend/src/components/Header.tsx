import React from 'react'
import './Header.css'
import excavatorImage from './excavator.png'

interface Props {
  buttons: JSX.Element
}

class Header extends React.Component<Props> {
  render (): JSX.Element {
    const { buttons } = this.props

    return (
      <div className='header'>
        <div className='header__content'>
          <img src={excavatorImage} alt='Spotify Digger logo' className='header__logo' />
          <div className='header__title'>
            Spotify Digger
          </div>

          <div className='header__dragPrompt'>
            Drag from Spotify and drop anywhere on the site
          </div>

          {buttons}
        </div>
      </div>
    )
  }
}

export default Header
