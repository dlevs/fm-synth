import last from 'lodash/last';
import clamp from 'lodash/clamp';
import { Point, RelativePoint } from '../lib/types';

export const cumulativeX = (points: Point[]) => points
	.reduce((accum, [x, y]) => {
		const [lastX] = last(accum) || [0, 0];
		return [
			...accum,
			[x + lastX, y],
		] as Point[];
	}, [] as Point[]);

export const constrainPoint = (
	[x, y]: Point,
	[maxX, maxY]: Point,
): RelativePoint => ({
	unconstrained: [x, y],
	constrained: [
		clamp(x, 0, maxX),
		clamp(y, 0, maxY),
	],
});

export const getPointFromEvent = ({
	clientX,
	clientY,
}: PointerEvent): Point => [
	clientX,
	clientY,
];

export const getRelativePointFromEvent = (
	event: PointerEvent,
	element?: Element,
): RelativePoint =>
	getPointRelativeToRect(
		getPointFromEvent(event),
		(element || event.target as Element).getBoundingClientRect(),
	);

export const getPointRelativeToRect = (
	[x, y]: Point,
	{ left, top, width, height }: ClientRect | DOMRect,
) =>
	constrainPoint(
		[x - left, y - top],
		[width, height],
	);
