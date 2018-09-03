import React, { ChangeEvent, Fragment, RefObject } from 'react';
import withUniqueId from './higherOrder/withUniqueId';

interface Props {
  id?: string
  label: string
  name: string
  min: number
  max: number
  value: number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void,
  inputRef?: RefObject<HTMLInputElement>
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
