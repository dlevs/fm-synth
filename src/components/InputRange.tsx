import React, { ChangeEvent, RefObject } from 'react';
import { Omit } from '../lib/types';

// TODO: rename
import UniqueId from './util/UniqueId';

interface Props {
  id: string
  label: string
  name: string
  min: number
  max: number
  value: number
  onChange: (event: ChangeEvent<HTMLInputElement>) => void,
  inputRef?: RefObject<HTMLInputElement>
}

const InputRange = ({ id, label, inputRef, ...otherProps }: Props) =>
  <>
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      type="range"
      step="1"
      ref={inputRef}
      {...otherProps}
    />
  </>


// TODO: Check if we end up creating a new instance of Unique ID class each time... ID should remain same
// TODO: Check the name of this component in dev tools
export default (props: Omit<Props, 'id'>) =>
  <UniqueId>
    {({ id }) => <InputRange {...props} id={id} />}
  </UniqueId>
