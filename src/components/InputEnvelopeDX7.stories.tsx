import { storiesOf } from '@storybook/react'
import { color } from '@storybook/addon-knobs'
import { useValue, enableHooks } from '../lib/storybookUtils.js'
import InputEnvelopeDX7 from './InputEnvelopeDX7.js'

storiesOf(InputEnvelopeDX7.name, module)
	.add('Basic usage', enableHooks(() => (
		<InputEnvelopeDX7
			{...useValue({
				rate1: 100,
				rate2: 127,
				rate3: 100,
				rate4: 100,
				level1: 100,
				level2: 80,
				level3: 30,
				level4: 0
			})}
			color={color('color', '#444')}
		/>
	)))
