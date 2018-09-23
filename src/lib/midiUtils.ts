import { DEFAULT_TUNING_IN_HERTZ, NOTE_OFFSET, NOTES_PER_OCTAVE } from './constants';

export const midiToFrequency = (
	note: number,
	tuning: number = DEFAULT_TUNING_IN_HERTZ,
): number => {
	return Math.pow(2, (note - NOTE_OFFSET) / NOTES_PER_OCTAVE) * tuning;
};

export const frequencyToMidi = (
	frequency: number,
	tuning: number = DEFAULT_TUNING_IN_HERTZ,
): number => {
	return NOTES_PER_OCTAVE * Math.log2(frequency / tuning) + NOTE_OFFSET;
};
