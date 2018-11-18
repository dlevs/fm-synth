import React from 'react';
import { storiesOf } from '@storybook/react';
import InputRange from '../components/InputRange';

const log = (val: any) => {
	console.log(val);
};

// TODO: Make more fields optional? Or not...
storiesOf('InputRange', module)
	.add('Default', () => (
		<InputRange
			label='My Label' name='myname' min={0} max={100} value={10} onChange={log} />
	));
