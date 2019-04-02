import { Oscillator } from '../../../lib/types'

const initialState: Oscillator[] = [
	{
		id: 'TODO:some-short-id-here',
		mode: 'ratio',
		ratio: 0,
		waveType: 'sawtooth',
		envelope: {
			attack: 0.1,
			decay: 0.1,
			sustain: 0.5,
			release: 2
		}
	},
	{
		id: 'TODO:some-short-id-here2',
		mode: 'ratio',
		ratio: 1,
		waveType: 'sawtooth',
		envelope: {
			attack: 0.001,
			decay: 0.3,
			sustain: 0.05,
			release: 1
		}
	}
]

const oscillatorsReducer = (state = initialState) => state

export default oscillatorsReducer
