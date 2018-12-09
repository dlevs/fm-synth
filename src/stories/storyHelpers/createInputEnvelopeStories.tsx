import React, { ComponentType } from 'react';
import mapValues from 'lodash/mapValues';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { color } from '@storybook/addon-knobs';
import { rangeMIDI } from './knobs';
import HandleOnChange from './HandleOnChange';
import { ObjectOf, ValueProps } from '../../lib/types';

type Props<T> = ValueProps<T> & {
	color?: string;
};

export default <T extends ObjectOf<number>>(
	Component: ComponentType<Props<T>>,
	defaults: T,
) => {
	storiesOf(Component.name, module)

		.add('Basic usage', () => (
			<HandleOnChange initialValue={defaults}>
				{({ value, onChange }) => (
					<Component
						color={color('color', '#444')}
						value={value}
						onChange={onChange}
					/>
				)}
			</HandleOnChange>
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
