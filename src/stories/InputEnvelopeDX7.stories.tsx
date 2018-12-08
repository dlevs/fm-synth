import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withInfo } from '@storybook/addon-info';
import InputEnvelopeDX7 from '../components/InputEnvelopeDX7';
import { withKnobs, number } from '@storybook/addon-knobs';
import { ADSREnvelope } from '../lib/types';

// TODO: Move
interface DX7Envelope {
	rate1: number;
	rate2: number;
	rate3: number;
	rate4: number;
	level1: number;
	level2: number;
	level3: number;
	level4: number;
}

const StatefulInputEnvelopeDX7 = (props: DX7Envelope) => {
	const [envelope, setEnvelope] = useState(props);
	return (
		<InputEnvelopeDX7
			{...envelope}
			onChange={setEnvelope}
		/>
	);
};

storiesOf('InputEnvelopeDX7', module)
	// TODO: Look into a global way to register these
	.addDecorator(withKnobs)
	.addDecorator(withInfo({ inline: true }))
	.add('Controlled by props', () => (
		<InputEnvelopeDX7
			attack={number('attack', 100)}
			decay={number('decay', 100)}
			sustain={number('sustain', 70)}
			release={number('release', 100)}
			onChange={action('onChange')}
		/>
	))
	.add('Controlled by drag', () => (
		<StatefulInputEnvelopeDX7
			rate1={100}
			rate2={100}
			rate3={100}
			rate4={100}
			level1={100}
			level2={80}
			level3={30}
			level4={0}
		/>
	));
