import React, { Component } from 'react';
import flow from 'lodash/flow';
import { EventManager } from '../../lib/eventUtils';

export const withMouseDownTracking = (WrappedComponent) => {
  class MouseDownTracking extends Component {
    onMouseDown = () => this.setState({ isMouseDown: true });
    onMouseUp = () => this.setState({ isMouseDown: false });

    state = { isMouseDown: false };

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
        <div onMouseDown={this.onMouseDown} onTouchStart={this.onMouseDown}>
          <WrappedComponent {...this.props} {...this.state} />;
        </div>
      )
    }
  }

  return MouseDownTracking;
};

export const withMouseOverTracking = (WrappedComponent) => {
  class MouseOverTracking extends Component {
    onMouseEnter = () => this.setState({ isMouseOver: true });
    onMouseLeave = () => this.setState({ isMouseOver: false });

    state = { isMouseOver: false };

    render() {
      return (
        <div onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
          <WrappedComponent {...this.props} {...this.state} />;
        </div>
      )
    }
  }

  return MouseOverTracking;
};

const withMouseTracking = flow(withMouseDownTracking, withMouseOverTracking);

export default withMouseTracking;
