import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { rangeMIDI } from './storyHelpers/knobs';
import HandleOnChange from './storyHelpers/HandleOnChange';
import InputEnvelopeADSR from '../components/InputEnvelopeADSR';

storiesOf('InputEnvelopeADSR', module)

	.add('Interactive', () => (
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
	))

	.add('Driven by props', () => (
		<InputEnvelopeADSR
			value={{
				attack: rangeMIDI('attack', 100),
				decay: rangeMIDI('decay', 100),
				sustain: rangeMIDI('sustain', 70),
				release: rangeMIDI('release', 100),
			}}
			onChange={action('onChange')}
		/>
	));
