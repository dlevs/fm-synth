import React, { Fragment, Ref } from 'react';
import withUniqueId from './higherOrder/withUniqueId';

interface Props {
  id: string
  label: string
  inputRef?: Ref<HTMLInputElement>
}

const InputRange = ({ id, label, inputRef, ...otherProps }: Props) => (
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
