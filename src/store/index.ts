import { configureStore, getDefaultMiddleware } from 'redux-starter-kit'
import reducer from './reducers'
import soundTriggerMiddleware from './middleware/soundTriggerMiddleware'

export type Store = ReturnType<typeof reducer>

export default configureStore({
	reducer,
	middleware: [
		...getDefaultMiddleware(),
		soundTriggerMiddleware
	],
	devTools: process.env.NODE_ENV === 'development'
})
