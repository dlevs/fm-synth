// TODO: Do separate style files for other components
import Color from 'color'
import { css } from 'emotion'

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

		'&[data-active="true"]': {
			strokeWidth: dotSizeActive
		}
	}
])

export const rangeGuideBox = (fill: string) => css({
	position: 'relative',
	zIndex: -1,
	pointerEvents: 'none',
	fill: Color(fill).alpha(0.1).toString()
})
