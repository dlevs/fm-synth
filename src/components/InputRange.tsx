import React, { HTMLProps, forwardRef, Ref } from 'react';
import useUniqueId from '../hooks/useUniqueId';
import { createOnChangeHandler } from '../lib/eventUtils';
import { ChangeHandler } from '../lib/types';

export interface Props extends HTMLProps<HTMLInputElement> {
	label: string;
	onChange: ChangeHandler<number>;
	ref?: Ref<HTMLInputElement>;
}

/**
 * A simple range input.
 */
export const InputRange = forwardRef<HTMLInputElement, Props>((
	{ label, onChange, ...otherProps },
	ref,
) => {
	const id = useUniqueId();

	return <>
		<label htmlFor={id}>{label}</label>
		<input
			id={id}
			ref={ref}
			type='range'
			onChange={createOnChangeHandler(onChange, Number)}
			{...otherProps}
		/>
	</>;
});

export default InputRange;
