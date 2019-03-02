import React from 'react'
import { storiesOf } from '@storybook/react'
import useValue from './storyHelpers/useValue'
import InputRangeLine from '../components/InputRangeLine'

const Demo = () => <>
	<InputRangeLine
		label='My horizontal input'
		{...useValue(10)}
	/>
	<InputRangeLine
		label='My vertical input'
		{...useValue(10)}
		orient='vertical'
	/>
</>

storiesOf('InputRangeLine', module)
	.add('Basic usage', () => (
		<Demo />
	))
