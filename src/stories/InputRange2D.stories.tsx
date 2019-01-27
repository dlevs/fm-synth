import React from 'react';
import { storiesOf } from '@storybook/react';
import useOnChange from './storyHelpers/useOnChange';
import InputRange2D from '../components/InputRange2D';

const xProps = {
	label: 'X Controls',
	name: 'mynamex',
};

const yProps = {
	label: 'Y Controls',
	name: 'mynamey',
};

const Demo2D = () => (
	<InputRange2D
		min={0}
		max={100}
		xProps={{
			...xProps,
			...useOnChange(10),
		}}
		yProps={{
			...yProps,
			...useOnChange(20),
		}}
	/>
);

const DemoXOnly = () => (
	<InputRange2D
		min={0}
		max={100}
		xProps={{
			...xProps,
			...useOnChange(10),
		}}
	/>
);

const DemoYOnly = () => (
	<InputRange2D
		min={0}
		max={100}
		yProps={{
			...yProps,
			...useOnChange(10),
		}}
	/>
);

storiesOf('InputRange2D', module)
	.add('With x and y dimensions', () => (
		<Demo2D />
	))
	.add('With only x dimension', () => (
		<DemoXOnly />
	))
	.add('With only y dimension', () => (
		<DemoYOnly />
	));
