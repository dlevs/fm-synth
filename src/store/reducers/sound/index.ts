import { combineReducers } from 'redux';
import oscillators, { Oscillator } from './oscillatorsReducer';

export default combineReducers({
	oscillators,
});

export interface Sound {
	oscillators: Oscillator[];
}
