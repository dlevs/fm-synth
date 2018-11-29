import produce from 'immer';
import createAction from '../../lib/createAction'
import { ValueOf, Note, NoteStatus } from '../../lib/types'

export type Action = ReturnType<ValueOf<typeof actions>>

const initialState = {
	activeNotes: [] as NoteStatus[],
	isSustainActive: false,
	isSostenutoActive: false,
};

export const actions = {
	// TODO: We need to prepend all fn names with "trigger"?
	triggerNoteOn: createAction<'NOTE_ON', Note>('NOTE_ON'),
	triggerNoteOff: createAction<'NOTE_OFF', Note>('NOTE_OFF'),
	triggerAllNotesOff: createAction('ALL_NOTES_OFF'),
	triggerSustainOn: createAction('SUSTAIN_ON'),
	triggerSustainOff: createAction('SUSTAIN_OFF'),
};

// TODO: What does all of this achieve? Sound generator will not be as declarative.
// It may be easier to do this in redux middleware / outside of redux completely
const notesReducer = (state = initialState, action: Action) =>
	produce(state, draft => {
		switch (action.type) {
			case actions.triggerNoteOn.type:
				draft.activeNotes.push({
					note: action.payload.note,
					velocity: action.payload.velocity,
					isReleased: false,
					isSostenuto: false,
				});
				break;

			case actions.triggerNoteOff.type:
				const noteToRemove = draft.activeNotes.find(({ note, isReleased }) =>
					note === action.payload.note && !isReleased,
				);

				if (!noteToRemove) {
					break;
				}

				if (draft.isSustainActive) {
					noteToRemove.isReleased = true;
					break;
				}

				draft.activeNotes = draft.activeNotes.filter(note => note !== noteToRemove);
				break;

			case actions.triggerAllNotesOff.type:
				draft.activeNotes = [];
				break;

			case actions.triggerSustainOn.type:
				draft.isSustainActive = true;
				break;

			case actions.triggerSustainOff.type:
				draft.isSustainActive = false;
				draft.activeNotes = draft.activeNotes.filter(({ isReleased }) => !isReleased);
		}
	});

export default notesReducer;
