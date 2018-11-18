import flow from 'lodash/flow';

export const SVG_MIN = 0;
export const SVG_MAX = 100;
export const SVG_VIEWBOX = `${SVG_MIN} ${SVG_MIN} ${SVG_MAX} ${SVG_MAX}`;

export const MIDI_MIN = 0;
export const MIDI_MAX = 127;

/**
 * Scale a MIDI value from 0 - 127 to a value between 0 - 1
 */
const scaleMidiValueBetween0And1 = (n: number) => n / MIDI_MAX;

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

export const scaleMidiValueToSVG = flow(
	scaleMidiValueBetween0And1,
	scaleNumberBetween(SVG_MIN, SVG_MAX),
);
