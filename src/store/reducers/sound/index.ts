import { combineReducers } from 'redux';
import oscillators, { State as Ocillators } from './oscillatorsReducer';

export default combineReducers({
	oscillators,
});

export interface State {
	oscillators: Ocillators;
}
