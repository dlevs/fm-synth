import React, { ChangeEvent, RefObject } from 'react';
import useUniqueId from './util/useUniqueId';

interface Props {
	label: string;
	name: string;
	min: number;
	max: number;
	value: number;
	onChange(event: ChangeEvent<HTMLInputElement>): void;
	inputRef?: RefObject<HTMLInputElement>;
}

const InputRange = ({ label, inputRef, ...otherProps }: Props) => {
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
