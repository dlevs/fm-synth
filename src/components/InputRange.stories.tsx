import { storiesOf } from '@storybook/react'
import useValue from '../hooks/useValue'
import InputRange from './InputRange'

const Demo = () => (
	<InputRange
		label='My Label'
		name='myname'
		{...useValue(10)}
	/>
)

storiesOf('InputRange', module)
	.add('Basic usage', () => (
		<Demo />
	))
