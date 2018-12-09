import React from 'react';
import { storiesOf } from '@storybook/react';
import { number } from '@storybook/addon-knobs';
import SVGPathLine from '../components/SVGPolyline';

const rangeOptions = {
	range: true,
	min: 0,
	max: 10,
	step: 0.1,
};

storiesOf('SVGPathLine', module)
	.add('Basic usage', () => (
		<svg
			viewBox='0 0 10 10'
			stroke='#000'
			strokeWidth='1'
			fill='none'
			height='300'
			width='100%'
			preserveAspectRatio='none'
		>
			<SVGPathLine
				vectorEffect='non-scaling-stroke'
				pointsArray={[
					[0, 5],
					[
						number('x', 4, rangeOptions),
						number('y', 10, rangeOptions),
					],
					[6, 2],
					[10, 5],
				]}
			/>
		</svg>
	));
