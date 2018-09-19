import { Middleware } from 'redux';
import { NOTE_ON, NOTE_OFF } from '../reducers/notesReducer';
import PolyVoice from '../../lib/audio/Voice';

let voices: PolyVoice[] = [];

// tslint:disable-next-line:no-unused
const soundTriggerMiddleware: Middleware = store => next => action => {
	if (action) {
		if (action.type === NOTE_ON) {
			const voice = new PolyVoice(action.note, action.velocity);

			voices.push(voice);
			voice.triggerAttack();
		} else if (action.type === NOTE_OFF) {
			// TODO: Duplicate logic here and in notesReducer...
			voices = voices.filter(voice => {
				if (voice.note === action.note) {
					voice.triggerRelease();
					return false;
				}

				return true;
			});
		}
	}

	next(action);
};

export default soundTriggerMiddleware;
