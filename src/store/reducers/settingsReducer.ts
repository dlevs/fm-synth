import produce from 'immer'
import createAction from '../../lib/createAction'
import { ValueOf } from '../../lib/types'

export type Action = ReturnType<ValueOf<typeof actions>>

const initialState = {
	baseFrequency: 440,
	polyphony: 8
}

export const actions = {
	setBaseFrequency: createAction<'SET_BASE_FREQUENCY', number>('SET_BASE_FREQUENCY'),
	setPolyphony: createAction<'SET_POLYPHONY', number>('SET_POLYPHONY')
}

const settingsReducer = (state = initialState, action: Action) =>
	produce(state, draft => {
		switch (action.type) {
			case actions.setBaseFrequency.type:
				draft.baseFrequency = action.payload
				break

			case actions.setPolyphony.type:
				draft.polyphony = action.payload
		}
	})

export default settingsReducer
