import React, { Component } from 'react';

let uniqueIdCounter = 0;

const withUniqueId = WrappedComponent => {
  class WithUniqueId extends Component {
    id = `unique-id-input-${uniqueIdCounter++}`;

    render() {
      return (
        <WrappedComponent
          id={this.id}
          {...this.props}
        />
      )
    }
  }

  return WithUniqueId;
}

export default withUniqueId;
