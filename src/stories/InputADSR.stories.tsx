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
	.addDecorator(withKnobs)
	.add('Controlled by props', withInfo({ inline: true })(() => (
		<InputADSR
			attack={number('attack', 100)}
			decay={number('decay', 100)}
			sustain={number('sustain', 70)}
			release={number('release', 100)}
			onChange={action('onChange')}
		/>
	)))
	.add('Controlled by drag', withInfo({ inline: true })(() => (
		<StatefulInputADSR
			attack={100}
			decay={100}
			sustain={70}
			release={100}
		/>
	)));
