import React, { Component, ComponentType } from 'react';
import { EventManager } from '../../lib/eventUtils';

export class State {
  public isMouseDown: boolean = false;
}

export default <Props extends {}>(WrappedComponent: ComponentType<Props>) => {
  class MouseDownTracking extends Component<Props, State> {
    public state = new State();

    public componentDidMount() {
      this.events.listen();
    }

    public componentWillUnmount() {
      this.events.stopListening();
    }

    public render() {
      return (
        <div onMouseDown={this.onMouseDown} onTouchStart={this.onMouseDown}>
          <WrappedComponent {...this.props} {...this.state} />
        </div>
      )
    }

    private onMouseDown = () => this.setState({ isMouseDown: true });
    private onMouseUp = () => this.setState({ isMouseDown: false });

    /* tslint:disable:member-ordering */
    private events = new EventManager([
      [document, 'mouseup', this.onMouseUp],
      [document, 'touchend', this.onMouseUp],
    ]);
    /* tslint:enable:member-ordering */
  }

  return MouseDownTracking;
};
