import React from 'react'
import { storiesOf } from '@storybook/react'
import { number } from '@storybook/addon-knobs'
import SVGPolyline from './SVGPolyline'

const rangeOptions = {
	range: true,
	min: 0,
	max: 100,
	step: 1
}

storiesOf('SVGPolyline', module)
	.add('Basic usage', () => (
		<svg
			viewBox='0 0 100 100'
			stroke='#000'
			strokeWidth='1'
			fill='none'
			height='300'
			width='100%'
			preserveAspectRatio='none'
		>
			<SVGPolyline
				vectorEffect='non-scaling-stroke'
				pointsArray={[
					[0, 50],
					[
						number('x', 40, rangeOptions),
						number('y', 100, rangeOptions)
					],
					[60, 20],
					[100, 50]
				]}
			/>
		</svg>
	))
