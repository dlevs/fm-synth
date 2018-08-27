import React, { Fragment } from 'react';
import withUniqueId from './higherOrder/withUniqueId';

const InputRange = ({ id, label, inputRef, ...otherProps }) => (
  <Fragment>
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      type="range"
      step="1"
      ref={inputRef}
      {...otherProps}
    />
  </Fragment>
);

export default withUniqueId(InputRange);
