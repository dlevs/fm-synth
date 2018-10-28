import { applyMiddleware, combineReducers, createStore, compose } from 'redux';
import notes, { Notes } from './reducers/notesReducer';
import settings, { Settings } from './reducers/settingsReducer';
import sound, { Sound } from './reducers/sound';
import soundTriggerMiddleware from './middleware/soundTriggerMiddleware';

const rootReducer = combineReducers({
	notes,
	settings,
	sound,
});

export interface Store {
	notes: Notes;
	settings: Settings;
	sound: Sound;
}

export default createStore(
	rootReducer,
	compose(
		applyMiddleware(soundTriggerMiddleware),
		window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
	),
);
