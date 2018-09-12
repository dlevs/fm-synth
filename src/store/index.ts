import { combineReducers, createStore } from 'redux';
import settings, { Settings } from './settingsReducer';

const rootReducer = combineReducers({
	settings,
});

export interface Store {
	settings: Settings;
}

export default createStore(rootReducer);
