import { combineReducers } from 'redux';
import notes, { State as Notes } from './notesReducer';
import settings, { State as Settings } from './settingsReducer';
import sound, { State as Sound } from './sound';

const rootReducer = combineReducers({
	notes,
	settings,
	sound,
});

export default rootReducer

export interface State {
	notes: Notes;
	settings: Settings;
	sound: Sound;
}
