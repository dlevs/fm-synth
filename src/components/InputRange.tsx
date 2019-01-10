import React, { HTMLProps, forwardRef, Ref } from 'react';
import useUniqueId from '../hooks/useUniqueId';

export interface Props extends HTMLProps<HTMLInputElement> {
	label: string;
	ref?: Ref<HTMLInputElement>;
}

/**
 * A simple range input.
 */
export const InputRange = forwardRef<HTMLInputElement, Props>((
	{ label, ...otherProps },
	ref,
) => {
	const id = useUniqueId();

	return <>
		<label htmlFor={id}>{label}</label>
		<input
			id={id}
			ref={ref}
			type='range'
			{...otherProps}
		/>
	</>;
});

export default InputRange;
