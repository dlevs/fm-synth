import { connect } from 'react-redux'
import InputKeyboard from '../components/InputKeyboard.js'
// TODO: Switch to absolute imports where it makes sense
import { Store } from '../store/index.js'
import { actions as notesActions } from '../store/reducers/notesReducer.js'

export default connect(
	// TODO: Use reselect?
	({ notes }: Store) => notes,
	{
		onNoteOn: notesActions.triggerNoteOn,
		onNoteOff: notesActions.triggerNoteOff
	}
)(InputKeyboard)
