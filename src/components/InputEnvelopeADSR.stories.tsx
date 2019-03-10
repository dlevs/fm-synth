import { storiesOf } from '@storybook/react'
import { color } from '@storybook/addon-knobs'
import { useValue, enableHooks } from '../lib/storybookUtils'
import InputEnvelopeADSR from './InputEnvelopeADSR'

storiesOf(InputEnvelopeADSR.name, module)
	.add('Basic usage', enableHooks(() => (
		<InputEnvelopeADSR
			{...useValue({
				attack: 100,
				decay: 100,
				sustain: 70,
				release: 100
			})}
			color={color('color', '#444')}
		/>
	)))
