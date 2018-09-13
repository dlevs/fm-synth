// TODO: Move this?
declare global {
	interface Window { __REDUX_DEVTOOLS_EXTENSION__: any; }
}

import { combineReducers, createStore } from 'redux';
import notes, { Notes } from './notesReducer';
import settings, { Settings } from './settingsReducer';

const rootReducer = combineReducers({
	notes,
	settings,
});

export interface Store {
	notes: Notes;
	settings: Settings;
}

export default createStore(
	rootReducer,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);
