import produce from 'immer';

export const NOTE_ON = 'NOTE_ON';
export const NOTE_OFF = 'NOTE_OFF';
export const ALL_NOTES_OFF = 'ALL_NOTES_OFF';
export const SUSTAIN_ON = 'SUSTAIN_ON';
export const SUSTAIN_OFF = 'SUSTAIN_OFF';

// TODO: Move this to the types.ts file
export interface Note {
	note: number;
	velocity: number;
}

export interface NoteStatus extends Note {
	isReleased: boolean;
	isSostenuto: boolean;
}

export interface Notes {
	activeNotes: NoteStatus[];
	isSustainActive: boolean;
	isSostenutoActive: boolean;
}

interface NoteAction extends Note {
	type: 'NOTE_ON' | 'NOTE_OFF' | 'ALL_NOTES_OFF';
}

type Action = NoteAction | {
	type: 'SUSTAIN_ON' | 'SUSTAIN_OFF';
};

const defaultNotes: Notes = {
	activeNotes: [],
	isSustainActive: false,
	isSostenutoActive: false,
};

const createNoteTrigger = (type: string) =>
	({ note, velocity }: Note) => ({
		type,
		note,
		velocity,
	});

export const noteActions = {
	// TODO: We need to prepend all fn names with "trigger"?
	triggerNoteOn: createNoteTrigger(NOTE_ON),
	triggerNoteOff: createNoteTrigger(NOTE_OFF),
	triggerAllNotesOff: () => ({ type: ALL_NOTES_OFF }),
	triggerSustainOn: () => ({ type: SUSTAIN_ON }),
	triggerSustainOff: () => ({ type: SUSTAIN_OFF }),
};

// TODO: What does all of this achieve? Sound generator will not be as declarative.
// It may be easier to do this in redux middleware / outside of redux completely
const notesReducer = (state = defaultNotes, action: Action) =>
	produce(state, draft => {
		switch (action.type) {
			case NOTE_ON:
				draft.activeNotes.push({
					note: action.note,
					velocity: action.velocity,
					isReleased: false,
					isSostenuto: false,
				});
				break;

			case NOTE_OFF:
				const noteToRemove = draft.activeNotes.find(({ note, isReleased }) =>
					note === action.note && !isReleased,
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

			case ALL_NOTES_OFF:
				draft.activeNotes = [];
				break;

			case SUSTAIN_ON:
				draft.isSustainActive = true;
				break;

			case SUSTAIN_OFF:
				draft.isSustainActive = false;
				draft.activeNotes = draft.activeNotes.filter(({ isReleased }) => !isReleased);
		}
	});

export default notesReducer;
