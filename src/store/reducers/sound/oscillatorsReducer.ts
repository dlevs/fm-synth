import produce from 'immer';
import { ADSREnvelope } from '../../../lib/types';

interface OscillatorBase {
	id: string;
	waveType: OscillatorType;
	envelope: ADSREnvelope;
}

interface OscillatorFixed extends OscillatorBase {
	mode: 'fixed';
	frequency: number;
}

interface OscillatorRatio extends OscillatorBase {
	mode: 'ratio';
	ratio: number;
}

export type Oscillator = OscillatorFixed | OscillatorRatio;

const defaultState: Oscillator[] = [
	{
		id: 'TODO:some-short-id-here',
		mode: 'ratio',
		ratio: 0,
		waveType: 'sawtooth',
		envelope: {
			attack: 0.01,
			decay: 0.1,
			sustain: 0.5,
			release: 2,
		},
	},
	{
		id: 'TODO:some-short-id-here2',
		mode: 'ratio',
		ratio: 1,
		waveType: 'sawtooth',
		envelope: {
			attack: 0.01,
			decay: 0.1,
			sustain: 0.5,
			release: 2,
		},
	},
];

const oscillatorsReducer = (state = defaultState) =>
	produce(state, () => {
		// switch (action.type) {
		// 	case SET_BASE_FREQUENCY:
		// 		draft.baseFrequency = action.value;
		// 		break;

		// 	case SET_POLYPHONY:
		// 		draft.polyphony = action.value;
		// }
	});

export default oscillatorsReducer;
