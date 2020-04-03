import { Middleware } from '@reduxjs/toolkit'
import { actions, Action } from '../reducers/notesReducer.js'
import PolyVoice from '../../lib/audio/Voice.js'
import { Note } from '../../lib/types.js'

let voices: PolyVoice[] = []

// tslint:disable-next-line:no-unused
const soundTriggerMiddleware: Middleware = () => next => (action: Action) => {
	if (action) {
		if (action.type === actions.triggerNoteOn.toString()) {
			const { note, velocity } = action.payload as Note
			const voice = new PolyVoice(note, velocity)

			voices.push(voice)
			voice.triggerAttack()
		} else if (action.type === actions.triggerNoteOff.toString()) {
			const { note } = action.payload as Note

			// TODO: Duplicate logic here and in notesReducer...
			voices = voices.filter(voice => {
				if (voice.note === note) {
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
