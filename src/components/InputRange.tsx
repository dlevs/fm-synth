import React, { ChangeEvent, RefObject } from 'react';
import UniqueId from './util/UniqueId';

interface Props {
  label: string
  name: string
  min: number
  max: number
  value: number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void,
  inputRef?: RefObject<HTMLInputElement>
}

const InputRange = ({ label, inputRef, ...otherProps }: Props) =>
  <UniqueId>
    {({ id }) => <>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        step="1"
        ref={inputRef}
        {...otherProps}
      />
    </>}
  </UniqueId>

export default InputRange;
