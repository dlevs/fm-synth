import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { rangeMIDI } from './storyHelpers/knobs';
import HandleOnChange from './storyHelpers/HandleOnChange';
import InputEnvelopeDX7 from '../components/InputEnvelopeDX7';

storiesOf('InputEnvelopeDX7', module)

	.add('Interactive', () => (
		<HandleOnChange initialValue={{
			rate1: 100,
			rate2: 100,
			rate3: 100,
			rate4: 100,
			level1: 100,
			level2: 80,
			level3: 30,
			level4: 0,
		}}>
			{({ value, onChange }) => (
				<InputEnvelopeDX7
					value={value}
					onChange={onChange}
				/>
			)}
		</HandleOnChange>
	))

	.add('Driven by props', () => (
		<InputEnvelopeDX7
			value={{
				rate1: rangeMIDI('rate1', 100),
				rate2: rangeMIDI('rate2', 100),
				rate3: rangeMIDI('rate3', 100),
				rate4: rangeMIDI('rate4', 100),
				level1: rangeMIDI('level1', 100),
				level2: rangeMIDI('level2', 80),
				level3: rangeMIDI('level3', 30),
				level4: rangeMIDI('level4', 0),
			}}
			onChange={action('onChange')}
		/>
	));
