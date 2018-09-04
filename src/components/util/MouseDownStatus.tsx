import React, { Component } from 'react';
import { EventManager } from '../../lib/eventUtils';
import { RenderPropComponentProps } from '../../lib/types';
export class State {
  public isMouseDown: boolean = false;
}

export default class MouseDownStatus extends Component<RenderPropComponentProps<State>, State> {
  public state = new State();

  private events = new EventManager(() => [
    [document, 'mouseup', this.onMouseUp],
    [document, 'touchend', this.onMouseUp],
  ]);

  public componentDidMount() {
    this.events.listen();
  }

  public componentWillUnmount() {
    this.events.stopListening();
  }

  public render() {
    return (
      <div onMouseDown={this.onMouseDown} onTouchStart={this.onMouseDown}>
        {this.props.children(this.state)}
      </div>
    );
  }

  private onMouseDown = () => this.setState({ isMouseDown: true });
  private onMouseUp = () => this.setState({ isMouseDown: false });
}
