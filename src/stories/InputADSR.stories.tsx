import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withInfo } from '@storybook/addon-info';
import InputADSR from '../components/InputADSR';
import { withKnobs, number } from '@storybook/addon-knobs';
import { ADSREnvelope } from '../lib/types';

const StatefulInputADSR = (props: ADSREnvelope) => {
	const [envelope, setEnvelope] = useState(props);
	return (
		<InputADSR
			{...envelope}
			onChange={setEnvelope}
		/>
	);
};

storiesOf('InputADSR', module)
	// TODO: Look into a global way to register these
	.addDecorator(withKnobs)
	.addDecorator(withInfo({ inline: true }))
	.add('Controlled by props', () => (
		<InputADSR
			attack={number('attack', 100)}
			decay={number('decay', 100)}
			sustain={number('sustain', 70)}
			release={number('release', 100)}
			onChange={action('onChange')}
		/>
	))
	.add('Controlled by drag', () => (
		<StatefulInputADSR
			attack={100}
			decay={100}
			sustain={70}
			release={100}
		/>
	));
