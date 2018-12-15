import React, { HTMLProps, RefObject } from 'react';
import useUniqueId from '../hooks/useUniqueId';

interface Props extends HTMLProps<HTMLInputElement> {
	label: string;
	name: string;
	min: number;
	max: number;
	value: number;
	// TODO: Can we use forwardRef?
	inputRef?: RefObject<HTMLInputElement>;
}

/**
 * A simple range input.
 */
export const InputRange = ({ label, inputRef, ...otherProps }: Props) => {
	const id = useUniqueId();

	return <>
		<label htmlFor={id}>{label}</label>
		<input
			id={id}
			type='range'
			step='1'
			ref={inputRef}
			{...otherProps}
		/>
	</>;
};

export default InputRange;
