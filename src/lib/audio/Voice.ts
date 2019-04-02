import ctx from './audioContext'
import { ADSREnvelope } from '../types'
import { midiToFrequency } from '../midiUtils'
import destination from './destination'
import store from '../../store'

// TODO: See if this number is OK, or can be reduced:
const OSCILLATOR_STOP_TIMEOUT_SECONDS = 5
const TIME_CONSTANT_MULTIPLIER = 0.5

// TODO: Reselect?
const getOscillators = () => store.getState().sound.oscillators

class Voice {
	private oscillator = ctx.createOscillator()
	private ampEnvelope = ctx.createGain()
	private ctx = ctx
	private ampMax: number

	public note: number
	public envelope: ADSREnvelope

	public constructor (
		note: number,
		velocity: number,
		waveType: OscillatorType,
		envelope: ADSREnvelope,
		// TODO: Might want to change this later:
		output: AudioNode = destination
	) {
		this.note = note
		this.envelope = envelope

		// TODO: use logarithmic scale here:
		this.ampMax = velocity / 127
		// TODO: What is default gain value? Is it necessary to set to 0?
		this.ampEnvelope.gain.value = 0
		this.ampEnvelope.connect(output)
		this.oscillator.connect(this.ampEnvelope)
		this.oscillator.type = waveType
		this.oscillator.frequency.value = midiToFrequency(note)
		// Cleanup
		this.oscillator.onended = () => {
			this.ampEnvelope.disconnect()
		}
	}

	public triggerAttack () {
		const { currentTime } = this.ctx
		const { attack, decay, sustain } = this.envelope
		const { gain } = this.ampEnvelope

		this.oscillator.start()
		gain.cancelScheduledValues(currentTime)
		gain.setTargetAtTime(
			this.ampMax,
			currentTime,
			attack * TIME_CONSTANT_MULTIPLIER
		)
		gain.setTargetAtTime(
			sustain * this.ampMax,
			currentTime + attack,
			decay * TIME_CONSTANT_MULTIPLIER
		)
	}

	public triggerRelease () {
		const { currentTime } = this.ctx
		const { release } = this.envelope
		const { gain } = this.ampEnvelope

		gain.cancelScheduledValues(currentTime)
		gain.setTargetAtTime(
			0,
			currentTime,
			release * TIME_CONSTANT_MULTIPLIER
		)
		this.oscillator.stop(currentTime + release + OSCILLATOR_STOP_TIMEOUT_SECONDS)
	}
}

// TODO: Break out into another file
// TODO: Potential bad name. May want to use "PolyVoice" for something else. Consider entire synth class structure
export default class PolyVoice {
	private voices: Voice[]

	public note: number

	public constructor (
		note: number,
		velocity: number,
		// TODO: Might want to change this later:
		output: AudioNode = destination
	) {
		this.note = note
		this.voices = getOscillators().map(oscillator => {
			const { waveType, envelope } = oscillator

			return new Voice(
				// TODO: What should ratio do exactly? And move `12` to a constants file
				oscillator.mode === 'ratio' ? note + (oscillator.ratio * 12) : note,
				velocity,
				waveType,
				envelope,
				output
			)
		})
	}

	public triggerAttack () {
		this.voices.forEach(voice => voice.triggerAttack())
	}

	public triggerRelease () {
		this.voices.forEach(voice => voice.triggerRelease())
	}
}
