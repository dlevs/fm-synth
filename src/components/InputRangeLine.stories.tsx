import { Fragment } from 'react'
import { storiesOf } from '@storybook/react'
import { useValue, enableHooks } from '../lib/storybookUtils'
import InputRangeLine from '../components/InputRangeLine'

storiesOf('InputRangeLine', module)
	.add('Basic usage', enableHooks(() => (
		<Fragment>
			<InputRangeLine
				{...useValue(10)}
				label='My horizontal input'
			/>
			<InputRangeLine
				{...useValue(10)}
				label='My vertical input'
				orient='vertical'
			/>
		</Fragment>
	)))
