import { jsx } from '@emotion/core'
import { ComponentType } from 'react'
import mapValues from 'lodash/mapValues'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { color } from '@storybook/addon-knobs'
import { rangeMIDI } from './storybookKnobs'
import useValue from '../../hooks/useValue'
import { ObjectOf } from '../types'

type Props<T> = {
	color?: string
	value: T
	setValue: (value: T) => void
}

export default <T extends ObjectOf<number>>(
	Component: ComponentType<Props<T>>,
	defaults: T
) => {
	const Demo = () => (
		<Component
			{...useValue(defaults)}
			color={color('color', '#444')}
		/>
	)

	storiesOf(Component.name, module)

		.add('Basic usage', () => (
			<Demo />
		))

		.add('With knobs', () => (
			<Component
				value={mapValues(
					defaults,
					(defaultValue, prop) => rangeMIDI(prop, defaultValue)
				) as T}
				setValue={action('setValue')}
				color={color('color', '#444')}
			/>
		))
}
