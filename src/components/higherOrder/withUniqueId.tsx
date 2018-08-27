import React, { Component, ComponentType } from 'react';

let uniqueIdCounter = 0;

export interface InjectedProps {
  id: string
}

const withUniqueId = <Props extends {}>(WrappedComponent: ComponentType<Props & InjectedProps>) => {
  class WithUniqueId extends Component<Props> {
    private id = `unique-id-input-${uniqueIdCounter++}`;

    public render() {
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
