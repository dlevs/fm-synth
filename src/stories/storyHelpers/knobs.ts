import { number } from '@storybook/addon-knobs'
import { MIDI_MIN, MIDI_MAX } from '../../lib/scales'

export const rangeMIDI = (name: string, value: number) =>
	number(name, value, {
		range: true,
		min: MIDI_MIN,
		max: MIDI_MAX,
		step: 1
	})
