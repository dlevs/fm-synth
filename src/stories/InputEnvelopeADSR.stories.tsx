import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { number } from '@storybook/addon-knobs';
import InputEnvelopeADSR from '../components/InputEnvelopeADSR';
import HandleOnChange from './storyHelpers/HandleOnChange';

// TODO: Move this
const optionsMIDIRange = {
	range: true,
	// TODO: Pull in variables
	min: 0,
	max: 127,
	step: 1,
};

storiesOf('InputEnvelopeADSR', module)

	.add('Controlled by props', () => (
		<InputEnvelopeADSR
			value={{
				attack: number('attack', 100, optionsMIDIRange),
				decay: number('decay', 100, optionsMIDIRange),
				sustain: number('sustain', 70, optionsMIDIRange),
				release: number('release', 100, optionsMIDIRange),
			}}
			onChange={action('onChange')}
		/>
	))

	.add('Controlled by drag', () => (
		<HandleOnChange initialValue={{
			attack: 100,
			decay: 100,
			sustain: 70,
			release: 100,
		}}>
			{({ value, onChange }) => (
				<InputEnvelopeADSR
					value={value}
					onChange={onChange}
				/>
			)}
		</HandleOnChange>
	));
