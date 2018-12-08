import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withInfo } from '@storybook/addon-info';
import InputEnvelopeADSR from '../components/InputEnvelopeADSR';
import { withKnobs, number } from '@storybook/addon-knobs';
import { ADSREnvelope } from '../lib/types';

const StatefulInputEnvelopeADSR = (props: ADSREnvelope) => {
	const [envelope, setEnvelope] = useState(props);
	return (
		<InputEnvelopeADSR
			{...envelope}
			onChange={setEnvelope}
		/>
	);
};

storiesOf('InputEnvelopeADSR', module)
	// TODO: Look into a global way to register these
	.addDecorator(withKnobs)
	.addDecorator(withInfo({ inline: true }))
	.add('Controlled by props', () => (
		<InputEnvelopeADSR
			attack={number('attack', 100)}
			decay={number('decay', 100)}
			sustain={number('sustain', 70)}
			release={number('release', 100)}
			onChange={action('onChange')}
		/>
	))
	.add('Controlled by drag', () => (
		<StatefulInputEnvelopeADSR
			attack={100}
			decay={100}
			sustain={70}
			release={100}
		/>
	));
