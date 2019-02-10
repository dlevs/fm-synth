import React from 'react'
import { storiesOf } from '@storybook/react'
import { number } from '@storybook/addon-knobs'
import SVGLineCircle from '../components/SVGLineCircle'
import { css } from 'emotion'

const styleOuterWrapper = css`
	display: flex;
`

const styleDemoWrapper = css`
	padding: 30px;
	margin: 15px;
	border: 1px solid #444;
`

const svgProps = {
	viewBox: '0 0 100 100',
	stroke: '#000',
	fill: '#000',
	height: '300',
	width: '100%',
	preserveAspectRatio: 'none'
}

storiesOf('SVGLineCircle', module)
	.add('Basic usage', () => {
		const radius = number('radius', 10, {
			range: true,
			min: 0,
			max: 50,
			step: 1
		})

		return (
			<div className={styleOuterWrapper}>
				<div className={styleDemoWrapper}>
					<h2>{'<SVGLineCircle>'}</h2>
					<p>{'<SVGLineCircle> is always a perfect circle. The `strokeWidth` property can be used to set a predictable pixel value for the size.'}</p>
					<p>Circle radius: <strong>{String(radius)}px</strong></p>
					<svg {...svgProps}>
						<SVGLineCircle
							vectorEffect='non-scaling-stroke'
							point={[50, 50]}
							strokeWidth={radius * 2}
						/>
					</svg>
				</div>
				<div className={styleDemoWrapper}>
					<h2>{'<circle>'}</h2>
					<p>{'The aspect ratio of <circle> is not maintained when the SVG is stretched, and it is not possible to set the size of the shape independently from the size of the entire <svg> parent.'}</p>
					<p>Circle radius: <strong>who knows mate...</strong></p>
					<svg {...svgProps}>
						<circle
							vectorEffect='non-scaling-stroke'
							cx='50'
							cy='50'
							r={radius}
						/>
					</svg>
				</div>
			</div>
		)
	})
