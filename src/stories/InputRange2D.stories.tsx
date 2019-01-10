import React, { ChangeEvent } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import InputRange2D from '../components/InputRange2D';

// TODO: Move
const onChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
	action('onChange')(target.value);
};

// TODO: Make more fields optional? Or not...
storiesOf('InputRange2D', module)
	.add('Basic usage', () => (
		<InputRange2D
			xProps={{
				label: 'My Label X',
				name: 'mynamex',
				min: 0,
				max: 100,
				value: 10,
				onChange,
			}}
			yProps={{
				label: 'My Label Y',
				name: 'mynamey',
				min: 0,
				max: 100,
				value: 20,
				onChange,
			}}
		/>
	));
