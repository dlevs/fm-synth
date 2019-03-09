import { SVGProps } from 'react'
import { Point } from '../lib/types'

// Safari browser (version 12.0.1 (14606.2.104.1.1)) will not respect the CSS
// rule `vector-effect: non-scaling-stroke;` if `x1 === x2` or `y1 === y2`.
// Add a small offset to render correctly.
const SAFARI_BUG_OFFSET = 0.00001

interface Props extends SVGProps<SVGLineElement> {
	point: Point
}

/**
 * Render a circle. To be used inside of an <svg> element.
 *
 * Uses the <line> element instead of <circle> in order to make use of
 * non-scaling-stroke, so the SVG can be scaled without increasing the
 * size of the circle.
 */
export const SVGLineCircle = ({ point, ...otherProps }: Props) =>
	<line
		x1={point[0]}
		y1={point[1]}
		x2={point[0] + SAFARI_BUG_OFFSET}
		y2={point[1] + SAFARI_BUG_OFFSET}
		strokeLinecap='round'
		{...otherProps}
	/>

export default SVGLineCircle
