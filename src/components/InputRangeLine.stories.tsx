import { Fragment } from 'react'
import { storiesOf } from '@storybook/react'
import { useValue, enableHooks } from '../lib/storybookUtils'
import InputRangeLine from '../components/InputRangeLine'

storiesOf('InputRangeLine', module)
	.add('Basic usage', enableHooks(() => (
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
	)))
