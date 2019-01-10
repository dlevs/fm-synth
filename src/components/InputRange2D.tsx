import React from 'react';
import InputRange, { Props as InputRangeProps } from './InputRange';

interface Props {
	xProps?: InputRangeProps;
	yProps?: InputRangeProps;
}

export const InputRange2D = ({ xProps, yProps }: Props) => {
	return <>
		{xProps && <InputRange {...xProps} />}
		{yProps && <InputRange {...yProps} />}
	</>;
};

export default InputRange2D;
