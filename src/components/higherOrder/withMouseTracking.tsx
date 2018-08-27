import React, { Component, ComponentType } from 'react';
// TODO: Maybe export as "MouseDownProps" to start with, for less boilerplate:
import withMouseDownTracking, { InjectedProps as MouseDownProps } from './withMouseDownTracking';
import withMouseOverTracking, { InjectedProps as MouseDownProps } from './withMouseOverTracking';

const withMouseTracking = <Props extends {}>
  (WrappedComponent: ComponentType<Props & MouseDownProps & MouseDownProps>): Component<Props & MouseDownProps & MouseDownProps> =>
    withMouseDownTracking(withMouseOverTracking(WrappedComponent))

export default withMouseTracking;

// export default flow(withMouseDownTracking, withMouseOverTracking);
