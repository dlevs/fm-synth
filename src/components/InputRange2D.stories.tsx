import { storiesOf } from '@storybook/react'
import { useValue, enableHooks } from '../lib/storybookUtils'
import InputRange2D from './InputRange2D'

storiesOf('InputRange2D', module)
	.add('With x and y dimensions', enableHooks(() => (
		<InputRange2D
			xProps={{
				label: 'X Controls',
				...useValue(10)
			}}
			yProps={{
				label: 'Y Controls',
				...useValue(20)
			}}
		/>
	)))
	.add('With only x dimension', enableHooks(() => (
		<InputRange2D
			xProps={{
				label: 'X Controls',
				...useValue(10)
			}}
		/>
	)))
	.add('With only y dimension', enableHooks(() => (
		<InputRange2D
			yProps={{
				label: 'Y Controls',
				...useValue(10)
			}}
		/>
	)))
