import React, { Component, ComponentType } from 'react';

export class State {
  public isMouseOver: boolean = false;
}

export default <Props extends {}>(WrappedComponent: ComponentType<Props>) => {
  class MouseOverTracking extends Component<Props, State> {
    public state = new State();

    public render() {
      return (
        <div onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
          <WrappedComponent {...this.props} {...this.state} />
        </div>
      )
    }

    private onMouseEnter = () => this.setState({ isMouseOver: true });
    private onMouseLeave = () => this.setState({ isMouseOver: false });
  }

  return MouseOverTracking;
};
