import parseMidi from 'parse-midi';
import { Store } from 'redux';
import { actions as notesActions } from '../store/reducers/notesReducer';

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

	access.addEventListener('statechange', event => {
		const { state } = (event as WebMidi.MIDIConnectionEvent).port;
		if (state !== 'connected' || event.target === null) {
			return;
		}
		addMidiEventMessageListeners(
			(event.target as WebMidi.MIDIAccess).inputs,
			onMessage,
		);
	});
};

// TODO: Export this type "ReturnType<typeof parseMidi>" from the parse-midi module for convenience
const getActionForMidiData = (midiEvent: ReturnType<typeof parseMidi>) => {
	switch (midiEvent.messageType) {
		case 'noteon':
			return notesActions.triggerNoteOn({
				note: midiEvent.key,
				velocity: midiEvent.velocity,
			});

		case 'noteoff':
			return notesActions.triggerNoteOff({
				note: midiEvent.key,
				velocity: midiEvent.velocity,
			});

		case 'controlchange':
			switch (midiEvent.controlFunction) {
				case 'sustainon':
					return notesActions.triggerSustainOn();
				case 'sustainoff':
					return notesActions.triggerSustainOff();
			}
			break;

		// TODO: Intellisense on "messageType" is great. Consider adding it to "channelModeMessage" and "controlFunction" too for parse-midi npm package
		case 'channelmodechange':
			switch (midiEvent.channelModeMessage) {
				case 'allnotesoff':
					return notesActions.triggerAllNotesOff();
			}
	}

	return null;
};

export default (store: Store) => {
	connectMidiDevices(event => {
		const midiEvent = parseMidi(event.data);
		const action = getActionForMidiData(midiEvent);

		if (action) {
			store.dispatch(action);
		}
	}).catch(err => console.error(err));
};
