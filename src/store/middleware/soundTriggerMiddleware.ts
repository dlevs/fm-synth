import { Middleware } from 'redux-starter-kit'
import { actions, Action } from '../reducers/notesReducer'
import PolyVoice from '../../lib/audio/Voice'

let voices: PolyVoice[] = []

// tslint:disable-next-line:no-unused
const soundTriggerMiddleware: Middleware = store => next => (action: Action) => {
	if (action) {
		if (action.type === actions.triggerNoteOn.toString()) {
			const voice = new PolyVoice(action.payload.note, action.payload.velocity)

			voices.push(voice)
			voice.triggerAttack()
		} else if (action.type === actions.triggerNoteOff.toString()) {
			// TODO: Duplicate logic here and in notesReducer...
			voices = voices.filter(voice => {
				if (voice.note === action.payload.note) {
					voice.triggerRelease()
					return false
				}

				return true
			})
		}
	}

	next(action)
}

export default soundTriggerMiddleware
