import { combineReducers } from '@reduxjs/toolkit'
import notes from './notesReducer.js'
import settings from './settingsReducer.js'
import sound from './sound/index.js'

export default combineReducers({
	notes,
	settings,
	sound
})
