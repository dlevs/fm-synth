import flow from 'lodash/flow'

export const MIDI_MIN = 0
export const MIDI_MAX = 127

/**
 * Scale a MIDI value from 0 - 127 to a value between 0 - 1
 */
const scaleMidiValueBetween0And1 = (n: number) => n / MIDI_MAX

/**
 * Create a function which scales values between 0 - 1 to
 * a be between `min` and `max`.
 */
export const scaleNumberBetween = (min: number, max: number) => {
	const step = max - min

	// `multiplier` is a number between 0 - 1
	return (multiplier: number) => (multiplier * step) + min
}

export const scaleMIDIValueBetween = (min: number, max: number) => flow(
	scaleMidiValueBetween0And1,
	scaleNumberBetween(min, max)
)

export const velocityColorMixScale = scaleMIDIValueBetween(0.2, 1)
