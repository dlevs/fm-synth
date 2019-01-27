import React from 'react';
import { storiesOf } from '@storybook/react';
import useOnChange from './storyHelpers/useOnChange';
import InputRange from '../components/InputRange';

const Demo = () => {
	const { value, onChange } = useOnChange(10);

	return (
		<InputRange
			label='My Label'
			name='myname'
			value={value}
			onChange={onChange}
		/>
	);
};

storiesOf('InputRange', module)
	.add('Basic usage', () => (
		<Demo />
	));
