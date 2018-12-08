import React from 'react';
import { MIDI_MIN, MIDI_MAX } from '../lib/scales';
import { DX7Envelope } from '../lib/types';
import InputEnvelope from './InputEnvelope';

interface Props {
	value: DX7Envelope;
	onChange(value: DX7Envelope): void;
}

export const InputEnvelopeDX7 = ({
	value,
	onChange,
}: Props) => {
	const {
		rate1,
		rate2,
		rate3,
		rate4,
		level1,
		level2,
		level3,
		level4,
	}	= value;

	return (
		<InputEnvelope
			onChange={onChange}
			// TODO: rename, and calculate this by passing an object of max values into pointsConfig generator
			divideWidth={4.5}
			value={value}
			pointsConfig={[
				{
					point: [MIDI_MIN, MIDI_MAX],
				},
				{
					point: [rate1, MIDI_MAX - level1],
					mapX: 'rate1',
				},
				{
					point: [rate2, MIDI_MAX - level2],
					mapX: 'rate2',
					mapY: 'level2',
				},
				{
					point: [rate3, MIDI_MAX - level3],
					mapX: 'rate3',
					mapY: 'level3',
				},
				{
					point: [MIDI_MAX / 2, MIDI_MAX - level3],
				},
				{
					point: [rate4, MIDI_MAX - level4],
					mapX: 'rate4',
					mapY: 'level4',
				},
				{
					point: [0, MIDI_MAX],
				},
			]}
		/>
	);
};

export default InputEnvelopeDX7;
