import { createSlice } from 'redux-starter-kit'

const settings = createSlice({
	slice: 'settings',
	initialState: {
		baseFrequency: 440,
		polyphony: 8
	},
	reducers: {
		setBaseFrequency: (state, action) => {
			state.baseFrequency = action.payload
		},
		setPolyphony: (state, action) => {
			state.polyphony = action.payload
		}
	}
})

export default settings.reducer
export const { actions } = settings
