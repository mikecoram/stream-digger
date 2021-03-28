import React from 'react'

interface Props {
  onLogout: () => void
}

class LogoutBtn extends React.Component<Props> {
  handleOnClick (): void {
    this.props.onLogout()
  }

  render (): JSX.Element {
    return (
      <button onClick={this.handleOnClick.bind(this)}>
        Logout
      </button>
    )
  }
}

export default LogoutBtn
