import parseMidi from 'parse-midi';
import { Store } from 'redux';
import { noteActions } from '../store/notesReducer';

type MidiMessageEventCallback = (event: WebMidi.MIDIMessageEvent) => void;

const addMidiEventMessageListeners = (
	inputs: Map<string, WebMidi.MIDIInput>,
	onMessage: MidiMessageEventCallback,
) => {
	Array.from(inputs.values()).forEach(input => {
		// TODO: Is this a good method, or use "addEventListener"?
		input.onmidimessage = onMessage;
	});
};

const connectMidiDevices = async (onMessage: MidiMessageEventCallback) => {
	const access = await navigator.requestMIDIAccess();

	addMidiEventMessageListeners(access.inputs, onMessage);

	access.addEventListener('statechange', (event: WebMidi.MIDIConnectionEvent) => {
		const { state } = event.port;
		if (state !== 'connected' || event.target === null) {
			return;
		}
		addMidiEventMessageListeners(
			(event.target as WebMidi.MIDIAccess).inputs,
			onMessage,
		);
	});
};

export default (store: Store) => {
	console.log(store);
	connectMidiDevices(event => {
		const midiEvent = parseMidi(event.data);
		let action;

		switch (midiEvent.messageType) {
			case 'noteon':
				action = noteActions.triggerNoteOn({
					note: midiEvent.key,
					velocity: midiEvent.velocity,
				});
				break;

			case 'noteoff':
				action = noteActions.triggerNoteOff({
					note: midiEvent.key,
					velocity: midiEvent.velocity,
				});
				break;

			case 'controlchange': {
				switch (midiEvent.controlFunction) {
					case 'sustainon':
						action = noteActions.triggerSustainOn();
						break;
					case 'sustainoff':
						action = noteActions.triggerSustainOff();
				}
			}

			// TODO: implement response to "allnotesoff" control change message
		}

		if (action) {
			store.dispatch(action);
		}
	}).catch(err => console.error(err));
};
