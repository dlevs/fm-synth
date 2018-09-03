import React, { Component, ComponentType } from 'react';

// TODO: This doesn't need to be exported

// TODO Move these things:
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
type Subtract<T, K> = Omit<T, keyof K>;

class State {
  public isMouseOver: boolean = false;
}

export default <Props extends {}>(WrappedComponent: ComponentType<Props>) => {
  class MouseOverTracking extends Component<Subtract<Props, State>, State> {
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
