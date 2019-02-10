import { combineReducers } from 'redux'
import notes from './notesReducer'
import settings from './settingsReducer'
import sound from './sound'

export default combineReducers({
	notes,
	settings,
	sound
})
