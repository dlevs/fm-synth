import { createSlice, PayloadAction } from 'redux-starter-kit'
import { NoteStatus, ValueOf, Note } from '../../lib/types'

export type Action = ReturnType<ValueOf<typeof actions>>

// TODO: What does all of this achieve? Sound generator will not be as declarative.
// It may be easier to do this in redux middleware / outside of redux completely
const notes = createSlice({
	slice: 'notes',
	initialState: {
		activeNotes: [] as NoteStatus[],
		isSustainActive: false,
		isSostenutoActive: false
	},
	reducers: {
		triggerNoteOn: (state, action: PayloadAction<Note>) => {
			const { note, velocity } = action.payload

			state.activeNotes.push({
				note,
				velocity,
				isReleased: false,
				isSostenuto: false
			})
		},
		triggerNoteOff: (state, action: PayloadAction<Note>) => {
			const noteToRemove = state.activeNotes.find(({ note, isReleased }) =>
				note === action.payload.note && !isReleased
			)

			if (!noteToRemove) {
				return
			}

			if (state.isSustainActive) {
				noteToRemove.isReleased = true
				return
			}

			state.activeNotes = state.activeNotes.filter(note => note !== noteToRemove)
		},
		triggerAllNotesOff: state => {
			state.activeNotes = []
		},
		triggerSustainOn: state => {
			state.isSustainActive = true
		},
		triggerSustainOff: state => {
			state.isSustainActive = false
			state.activeNotes = state.activeNotes.filter(({ isReleased }) => !isReleased)
		}
	}
})

export default notes.reducer
export const { actions } = notes
