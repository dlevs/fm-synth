import { connect } from 'react-redux';
import InputKeyboard from '../components/InputKeyboard';
import { Store } from '../store';
import { actions as notesActions } from '../store/reducers/notesReducer';

export default connect(
	// TODO: Use reselect?
	({ notes }: Store) => notes,
	{
		onNoteOn: notesActions.triggerNoteOn,
		onNoteOff: notesActions.triggerNoteOff,
	},
)(InputKeyboard);
