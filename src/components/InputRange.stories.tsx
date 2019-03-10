import { storiesOf } from '@storybook/react'
import { useValue, enableHooks } from '../lib/storybookUtils'
import InputRange from './InputRange'

storiesOf('InputRange', module)
	.add('Basic usage', enableHooks(() => (
		<InputRange
			label='My Label'
			name='myname'
			{...useValue(10)}
		/>
	)))
