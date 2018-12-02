import React, { ChangeEvent } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withInfo } from '@storybook/addon-info';
import InputRange from '../components/InputRange';

const onChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
	action('onChange')(target.value);
};

// TODO: Make more fields optional? Or not...
storiesOf('InputRange', module)
	.addDecorator(withInfo({ inline: true }))
	.add('InputRange', () => (
		<InputRange
			label='My Label'
			name='myname'
			min={0}
			max={100}
			value={10}
			onChange={onChange} />
	));
