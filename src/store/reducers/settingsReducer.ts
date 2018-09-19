import produce from 'immer';

export const SET_BASE_FREQUENCY = 'SET_BASE_FREQUENCY';
export const SET_POLYPHONY = 'SET_POLYPHONY';

const defaultSettings = {
	baseFrequency: 440,
	polyphony: 8,
};

export type Settings = typeof defaultSettings;

// TODO: Move
interface Action<T> {
	type: string;
	value: T;
}

const settingsReducer = (state = defaultSettings, action: Action<number>) =>
	produce(state, draft => {
		switch (action.type) {
			case SET_BASE_FREQUENCY:
				draft.baseFrequency = action.value;
				break;

			case SET_POLYPHONY:
				draft.polyphony = action.value;
		}
	});

export default settingsReducer;
