import React, { ComponentType } from 'react';
import mapValues from 'lodash/mapValues';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { color } from '@storybook/addon-knobs';
import { rangeMIDI } from './knobs';
import useOnChange from './useOnChange';
import { ObjectOf, ValueProps } from '../../lib/types';

type Props<T> = ValueProps<T> & {
	color?: string;
};

export default <T extends ObjectOf<number>>(
	Component: ComponentType<Props<T>>,
	defaults: T,
) => {
	const Demo = () => (
		<Component
			{...useOnChange(defaults)}
			color={color('color', '#444')}
		/>
	);

	storiesOf(Component.name, module)

		.add('Basic usage', () => (
			<Demo />
		))

		.add('With knobs', () => (
			<Component
				value={mapValues(
					defaults,
					(defaultValue, prop) => rangeMIDI(prop, defaultValue),
				) as T}
				color={color('color', '#444')}
				onChange={action('onChange')}
			/>
		));
};
