import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import reducer from './reducers/index.js'
import soundTriggerMiddleware from './middleware/soundTriggerMiddleware.js'

export type Store = ReturnType<typeof reducer>

export default configureStore({
	reducer,
	middleware: [
		...getDefaultMiddleware(),
		soundTriggerMiddleware
	],
	devTools: process.env.NODE_ENV === 'development'
})
