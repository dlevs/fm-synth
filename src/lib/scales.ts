import flow from 'lodash/flow';

/**
 * Scale a MIDI value from 0 - 127 to a value between 0 - 1
 */
const scaleMidiValueBetween0And1 = (n: number) => n / 127;

/**
 * Create a function which scales values between 0 - 1 to
 * a be between `min` and `max`.
 */
const scaleNumberBetween = (min: number, max: number) => {
	const step = max - min;

	// `multiplier` is a number between 0 - 1
	return (multiplier: number) => (multiplier * step) + min;
};

export const velocityColorMixScale = flow(
	scaleMidiValueBetween0And1,
	scaleNumberBetween(0.2, 1),
);
