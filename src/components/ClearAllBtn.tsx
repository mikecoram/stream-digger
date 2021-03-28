import React from 'react'

interface Props {
  onClearItems: () => void
}

class ClearAllBtn extends React.Component<Props> {
  handleOnClick (): void {
    this.props.onClearItems()
  }

  render (): JSX.Element {
    return (
      <button onClick={this.handleOnClick.bind(this)}>
        Clear All
      </button>
    )
  }
}

export default ClearAllBtn
