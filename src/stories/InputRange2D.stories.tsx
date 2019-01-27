import React from 'react';
import { storiesOf } from '@storybook/react';
import useOnChange from './storyHelpers/useOnChange';
import InputRange2D from '../components/InputRange2D';
import { ChangeHandler } from '../lib/types';

const defaultXProps = {
	label: 'My Label X',
	name: 'mynamex',
	min: 0,
	max: 100,
};

const defaultYProps = {
	label: 'My Label Y',
	name: 'mynamey',
	min: 0,
	max: 100,
};

const Demo2D = () => {
	const xValueProps = useOnChange(10);
	const yValueProps = useOnChange(20);

	return (
		<InputRange2D
			xProps={{
				...defaultXProps,
				value: xValueProps.value,
				onChange: xValueProps.onChange as ChangeHandler<number>,
			}}
			yProps={{
				...defaultYProps,
				value: yValueProps.value,
				onChange: yValueProps.onChange as ChangeHandler<number>,
			}}
		/>
	);
};

const DemoXOnly = () => {
	const xValueProps = useOnChange(10);

	return (
		<InputRange2D
			xProps={{
				...defaultXProps,
				value: xValueProps.value,
				onChange: xValueProps.onChange as ChangeHandler<number>,
			}}
		/>
	);
};

const DemoYOnly = () => {
	const yValueProps = useOnChange(10);

	return (
		<InputRange2D
			xProps={{
				...defaultYProps,
				value: yValueProps.value,
				onChange: yValueProps.onChange as ChangeHandler<number>,
			}}
		/>
	);
};

// TODO: Make more fields optional? Or not...
storiesOf('InputRange2D', module)
	.add('Basic usage', () => (
		<Demo2D />
	))
	.add('With only x dimension', () => (
		<DemoXOnly />
	))
	.add('With only y dimension', () => (
		<DemoYOnly />
	));
