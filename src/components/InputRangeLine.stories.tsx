import { Fragment } from 'react'
import { storiesOf } from '@storybook/react'
import useValue from '../hooks/useValue'
import InputRangeLine from '../components/InputRangeLine'

const Demo = () => (
	<Fragment>
		<InputRangeLine
			// label='My horizontal input'
			{...useValue(10)}
		/>
		<InputRangeLine
			// label='My vertical input'
			{...useValue(10)}
			orient='vertical'
		/>
	</Fragment>
)

storiesOf('InputRangeLine', module)
	.add('Basic usage', () => (
		<Demo />
	))
