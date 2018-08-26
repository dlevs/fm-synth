import React, { Component } from 'react';
import { EventManager } from '../../lib/eventUtils';

// TODO: This could be 2 HOC: withMouseDownTracking and withMouseOverTracking
const withMouseTracking = (WrappedComponent) => {
  class MouseTracking extends Component {
    onMouseDown = () => this.setState({ isMouseDown: true });
    onMouseUp = () => this.setState({ isMouseDown: false });

    onMouseEnter = () => this.setState({ isMouseOver: true });
    onMouseLeave = () => this.setState({ isMouseOver: false });

    state = {
      isMouseDown: false,
      isMouseOver: false,
    }

    events = new EventManager([
      [document, 'mouseup', this.onMouseUp],
      [document, 'touchend', this.onMouseUp],
    ]);

    componentDidMount() {
      this.events.listen();
    }

    componentWillUnmount() {
      this.events.stopListening();
    }

    render() {
      return (
        <div
          onMouseDown={this.onMouseDown}
          onTouchStart={this.onMouseDown}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          <WrappedComponent {...this.props} {...this.state} />;
        </div>
      )
    }
  }

  return MouseTracking;
};

export default withMouseTracking;
