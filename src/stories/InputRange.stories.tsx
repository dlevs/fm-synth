import React from 'react'
import { storiesOf } from '@storybook/react'
import useValue from './storyHelpers/useValue'
import InputRange from '../components/InputRange'

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
