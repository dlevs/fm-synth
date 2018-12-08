import React from 'react';
import { MIDI_MIN, MIDI_MAX } from '../lib/scales';
import { ADSREnvelope } from '../lib/types';
import InputEnvelope from './InputEnvelope';

interface Props {
	value: ADSREnvelope;
	onChange(value: ADSREnvelope): void;
}

export const InputEnvelopeADSR = ({
	value,
	onChange,
}: Props) => {
	const {
		attack,
		decay,
		sustain,
		release,
	}	= value;

	return (
		<InputEnvelope
			onChange={onChange}
			// TODO: rename, and calculate this by passing an object of max values into pointsConfig generator
			divideWidth={3.5}
			value={value}
			pointsConfig={[
				{
					point: [MIDI_MIN, MIDI_MAX],
				},
				{
					point: [attack, MIDI_MIN],
					mapX: 'attack',
				},
				{
					point: [decay, MIDI_MAX - sustain],
					mapX: 'decay',
					mapY: 'sustain',
				},
				{
					point: [MIDI_MAX / 2, MIDI_MAX - sustain],
				},
				{
					point: [release, MIDI_MAX],
					mapX: 'release',
				},
			]}
		/>
	);
};

export default InputEnvelopeADSR;
