import React, { ChangeEvent } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import InputRange from '../components/InputRange';

// TODO: Move
const onChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
	action('onChange')(target.value);
};

// TODO: Make more fields optional? Or not...
storiesOf('InputRange', module)
	.add('Basic usage', () => (
		<InputRange
			label='My Label'
			name='myname'
			min={0}
			max={100}
			value={10}
			onChange={onChange} />
	));
