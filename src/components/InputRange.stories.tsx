import { storiesOf } from '@storybook/react'
import { useValue, enableHooks } from '../lib/storybookUtils.js'
import InputRange from './InputRange.js'

storiesOf('InputRange', module)
	.add('Basic usage', enableHooks(() => (
		<InputRange
			label='My Label'
			name='myname'
			{...useValue(10)}
		/>
	)))
