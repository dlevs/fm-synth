import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { number } from '@storybook/addon-knobs'
import InputKeyboard from './InputKeyboard'

storiesOf('InputKeyboard', module)
	.add('Basic usage', () => (
		<InputKeyboard
			keyWidth={number('keyWidth', 60, {}, 'Props')}
			activeNotes={[
				{
					note: number('note', 37, {}, 'Active Note'),
					velocity: number('velocity', 127, {}, 'Active Note')
				},
				{ note: 41, velocity: 127 },
				{ note: 44, velocity: 127 }
			]}
			onNoteOn={action('onNoteOn')}
			onNoteOff={action('onNoteOff')}
		/>
	))
