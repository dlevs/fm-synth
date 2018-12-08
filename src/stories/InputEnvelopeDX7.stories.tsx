import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { withInfo } from '@storybook/addon-info';
import InputEnvelopeDX7 from '../components/InputEnvelopeDX7';
import { withKnobs, number } from '@storybook/addon-knobs';
import HandleOnChange from './storyHelpers/HandleOnChange';

// TODO: Move this
const optionsMIDIRange = {
	range: true,
	// TODO: Pull in variables
	min: 0,
	max: 127,
	step: 1,
};

storiesOf('InputEnvelopeDX7', module)
	// TODO: Look into a global way to register these
	.addDecorator(withKnobs)
	.addDecorator(withInfo({ inline: true, maxPropObjectKeys: 15 }))
	.add('Controlled by props', () => (
		<InputEnvelopeDX7
			value={{
				rate1: number('rate1', 100, optionsMIDIRange),
				rate2: number('rate2', 100, optionsMIDIRange),
				rate3: number('rate3', 100, optionsMIDIRange),
				rate4: number('rate4', 100, optionsMIDIRange),
				level1: number('level1', 100, optionsMIDIRange),
				level2: number('level2', 80, optionsMIDIRange),
				level3: number('level3', 30, optionsMIDIRange),
				level4: number('level4', 0, optionsMIDIRange),
			}}
			onChange={action('onChange')}
		/>
	))
	.add('Controlled by drag', () => (
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
	));
