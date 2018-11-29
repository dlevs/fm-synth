import { applyMiddleware, createStore, compose } from 'redux';
import rootReducer, { State } from './reducers';
import soundTriggerMiddleware from './middleware/soundTriggerMiddleware';

export type Store = State;

export default createStore(
	rootReducer,
	compose(
		applyMiddleware(soundTriggerMiddleware),
		window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
	),
);
