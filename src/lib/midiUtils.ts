const DEFAULT_TUNING = 440;
const NOTE_OFFSET = 69;
const NOTES_PER_OCTAVE = 12;

export const midiToFrequency = (
	note: number,
	tuning: number = DEFAULT_TUNING,
): number => {
	return Math.pow(2, (note - NOTE_OFFSET) / NOTES_PER_OCTAVE) * tuning;
};

export const frequencyToMidi = (
	frequency: number,
	tuning: number = DEFAULT_TUNING,
): number => {
	return NOTES_PER_OCTAVE * Math.log2(frequency / tuning) + NOTE_OFFSET;
};
