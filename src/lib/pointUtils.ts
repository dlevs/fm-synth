import last from 'lodash/last';
import flow from 'lodash/flow';
import clamp from 'lodash/clamp';
import { Point, RelativePoint, PointConfig } from '../lib/types';

type NumberTransform = (value: number) => number;

// A tiny number to cumulatively add to each point so that no 2 points
// ever have the exact same value. This prevents 2 points from getting
// "stuck together" when dragging them to the same coordinate.
const NO_STICK_OFFSET = 0.00000001;

export const getClosestPointIndex = (
	points: (Point | null)[],
	[x, y]: Point,
) => {
	const distances = points.map(point => {
		if (!point) {
			return Number.POSITIVE_INFINITY;
		}

		const [x2, y2] = point;
		return Math.abs(x - x2) + Math.abs(y - y2);
	});
	const distance = Math.min(...distances);

	return distances.indexOf(distance);
};

export const cumulativeX = (points: Point[]) => points
	.reduce((accum, [x, y]) => {
		const [lastX] = last(accum) || [0, 0];
		return [
			...accum,
			[
				x + lastX + NO_STICK_OFFSET,
				y + NO_STICK_OFFSET,
			],
		] as Point[];
	}, [] as Point[]);

export const expandPointConfigs = (
	pointConfigs: PointConfig[],
	scaleX: NumberTransform,
	scaleY: NumberTransform,
) => flow(
	(configs: PointConfig[]) => configs.map(({ point }) => point),
	cumulativeX,
	points => points.map(([currentX, currentY]) => [
		scaleX(currentX),
		scaleY(currentY),
	] as Point),
	points => points.map((currentPoint, i) => {
		const config = pointConfigs[i];
		const { mapX, mapY } = config;
		return {
			...config,
			point: currentPoint,
			isInteractive: !!(mapX || mapY),
			interactiveKey: `${mapX}${mapY}`,
		};
	}),
)(pointConfigs);

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
