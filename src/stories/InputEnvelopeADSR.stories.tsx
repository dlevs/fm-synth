import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withInfo } from '@storybook/addon-info';
import InputEnvelopeADSR from '../components/InputEnvelopeADSR';
import { withKnobs, number } from '@storybook/addon-knobs';
import { ADSREnvelope } from '../lib/types';

interface StatefulInputEnvelopeADSRProps {
	initialValue: ADSREnvelope;
}

const StatefulInputEnvelopeADSR = ({ initialValue }: StatefulInputEnvelopeADSRProps) => {
	const [value, setValue] = useState(initialValue);
	return (
		<InputEnvelopeADSR
			value={value}
			onChange={setValue}
		/>
	);
};

storiesOf('InputEnvelopeADSR', module)
	// TODO: Look into a global way to register these
	.addDecorator(withKnobs)
	.addDecorator(withInfo({ inline: true }))
	.add('Controlled by props', () => (
		<InputEnvelopeADSR
			value={{
				attack: number('attack', 100),
				decay: number('decay', 100),
				sustain: number('sustain', 70),
				release: number('release', 100),
			}}
			onChange={action('onChange')}
		/>
	))
	.add('Controlled by drag', () => (
		<StatefulInputEnvelopeADSR
			initialValue={{
				attack: 100,
				decay: 100,
				sustain: 70,
				release: 100,
			}}
		/>
	));
