import React, { ComponentType } from 'react';
import mapValues from 'lodash/mapValues';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { rangeMIDI } from './knobs';
import HandleOnChange from './HandleOnChange';
import { ObjectOf, ValueProps } from '../../lib/types';

export default <T extends ObjectOf<number>>(
	Component: ComponentType<ValueProps<T>>,
	defaults: T,
) => {
	storiesOf(Component.name, module)

		.add('Interactive', () => (
			<HandleOnChange initialValue={defaults}>
				{({ value, onChange }) => (
					<Component
						value={value}
						onChange={onChange}
					/>
				)}
			</HandleOnChange>
		))

		.add('Driven by props', () => (
			<Component
				value={mapValues(
					defaults,
					(defaultValue, prop) => rangeMIDI(prop, defaultValue),
				) as T}
				onChange={action('onChange')}
			/>
		));
};
