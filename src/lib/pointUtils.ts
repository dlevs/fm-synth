import last from 'lodash/last';
import flow from 'lodash/flow';
import clamp from 'lodash/clamp';
import { Point, RelativePoint, PointConfig } from '../lib/types';

type NumberTransform = (value: number) => number;

export const cumulativeX = (points: Point[]) => points
	.reduce((accum, [x, y]) => {
		const [lastX] = last(accum) || [0, 0];
		return [
			...accum,
			[x + lastX, y],
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
