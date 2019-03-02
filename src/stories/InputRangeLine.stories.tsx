import React from 'react'
import { storiesOf } from '@storybook/react'
import useValue from './storyHelpers/useValue'
import InputRangeLine from '../components/InputRangeLine'

const Demo = () => (
	<InputRangeLine
		label='My Label'
		name='myname'
		{...useValue(10)}
	/>
)

storiesOf('InputRangeLine', module)
	.add('Basic usage', () => (
		<Demo />
	))
