// TODO: Do separate style files for other components
import { opacify } from 'polished'
import { css } from '@emotion/core'

export const dotSize = 6
export const dotSizeActive = 12
export const padding = dotSizeActive

export const wrapper = css({
	padding,
	cursor: 'grab',
	userSelect: 'none',
	touchAction: 'none'
})

// TODO: Remove me:
// &:not([data-status="inactive"]) {
// 	polyline {
// 		/* stroke-width: 1.5px, */
// 	}
// }

// &[data-status="active"] {
// 	cursor: grabbing,
// }

export const svg = css({
	display: 'block',
	overflow: 'visible'
})

export const svgBase = (stroke: string) => css({
	vectorEffect: 'non-scaling-stroke',
	strokeWidth: 1,
	stroke,
	fill: 'none'
})

export const circle = (color: string) => css([
	svgBase(color),
	{
		position: 'relative',
		zIndex: 1,
		strokeWidth: dotSize,
		transition: 'stroke-width 0.1s',

		'&[data-active="true"]': {
			transition: 'stroke-width 0s',
			strokeWidth: dotSizeActive
		}
	}
])

export const rangeGuideBox = (fill: string) => css({
	position: 'relative',
	zIndex: -1,
	pointerEvents: 'none',
	fill: opacify(-0.9, fill)
})
