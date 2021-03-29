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
          <img src={excavatorImage} className="header__logo" />
          <span className='header__title'>
            Spotify Digger
          </span>

          {buttons}
        </div>
      </div>
    )
  }
}

export default Header
