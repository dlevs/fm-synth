import { connect } from 'react-redux';
import InputKeyboard from '../components/InputKeyboard';
import { Store } from '../store';
import { noteActions } from '../store/notesReducer';

export default connect(
	// TODO: Use reselect?
	({ notes }: Store) => notes,
	{
		onNoteOn: noteActions.triggerNoteOn,
		onNoteOff: noteActions.triggerNoteOff,
	},
)(InputKeyboard);
