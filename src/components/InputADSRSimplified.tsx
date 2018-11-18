import React, { useState, useEffect, MouseEvent, HTMLAttributes } from 'react';
import last from 'lodash/last';
import sumBy from 'lodash/sumBy';
// import map from 'lodash/fp/map';
import flatMap from 'lodash/fp/flatMap';
import { css } from 'emotion';
import { MIDI_MIN, MIDI_MAX, SVG_VIEWBOX, scaleMidiValueToSVG } from '../lib/scales';

// TODO: Move me
type Point = [number, number];
// type ParamName = 'attack' | 'decay' | 'sustain' | 'release';

interface Props {
	attack: number;
	decay: number;
	sustain: number;
	release: number;
	onChange(changes: [string, number][]): void;
}

interface SVGPointProps {
	point: Point;
	name: string;
	onMouseDown(event: MouseEvent): void;
}

interface SVGLineCircleProps extends HTMLAttributes<SVGLineElement> {
	x: number;
	y: number;
}

const styleWrapper = css`
	padding: 12px;
`;

const styleSvg = css`
	overflow: visible;
	filter: drop-shadow(0 0 5px #000);

	&:hover {
		path {
			fill: rgba(0, 0, 0, 0.05);
		}
	}
`;

const styleSvgBase = css`
	vector-effect: non-scaling-stroke;
	stroke-width: 1;
	stroke: #444;
	fill: none;
`;

const styleHitbox = css`
	${styleSvgBase}
	stroke: transparent;
	z-index: 1;
	position: relative;
	stroke-width: 50;
	cursor: grab;
`;

const styleCircle = css`
	${styleSvgBase}
	pointer-events: none;
	stroke-width: 6;

	.${styleHitbox}:hover + & {
		stroke-width: 12;
	}
`;

// const onMouseMove = () => {
// 	if (!this.canvas.current) {
// 		return;
// 	}

// 	const { pointHitboxMouse, inputMax, onChange, isMouseDown } = this.props;
// 	const { activePointIndex } = this.state;
// 	const { x, y } = getRelativeMouseCoordinates(event, this.canvas.current);

// 	if (
// 		event.target !== this.canvas.current &&
// 		// TODO: Do we need to check mouseDown status?
// 		!(isMouseDown && activePointIndex)
// 	) {
// 		return;
// 	}

// 	if (!isMouseDown) {
// 		const point = this.getClosestPointToEvent(event, pointHitboxMouse);
// 		this.setState({ activePointIndex: point ? point.index : null });
// 		return;
// 	}

// 	if (typeof activePointIndex !== 'number') {
// 		return;
// 	}

// 	const { mapX, mapY, canvasControl } = this.points[activePointIndex];

// 	if (!canvasControl) {
// 		return;
// 	}

// 	// TODO: Make some generic top-level types maybe? Like Array<[string, number]> to reuse
// 	const changes: [string, number][] = [];
// 	if (mapX) {
// 		const range = (this.points[activePointIndex].width / this.pointWidthTotal) * this.canvasOffsetWidth;
// 		const multiplier = (x - this.getPointOffsetX(activePointIndex)) / range;
// 		const xMidiValue = this.clampValue(multiplier * inputMax);
// 		changes.push([mapX, xMidiValue]);
// 	}
// 	if (mapY) {
// 		const multiplier = (y - this.offset) / this.canvasOffsetHeight;
// 		const yMidiValue = inputMax - this.clampValue(multiplier * inputMax);
// 		changes.push([mapY, yMidiValue]);
// 	}
// 	if (changes.length) {
// 		onChange(changes);
// 	}
// }

const SVGLineCircle = ({ x, y, ...otherProps }: SVGLineCircleProps) =>
	<line
		x1={x}
		y1={y}
		x2={x}
		y2={y}
		strokeLinecap='round'
		{...otherProps}
	/>;

/**
 * Render a circle. To be used inside of an <svg> element.
 *
 * Uses the <line> element instead of <circle> in order to make use of
 * non-scaling-stroke, so the SVG can be scaled without increasing the
 * size of the circle.
 */
const SVGPoint = ({ point, name, onMouseDown }: SVGPointProps) => {
	const [x, y] = point;

	return (
		<>
			<SVGLineCircle
				x={x}
				y={y}
				className={styleHitbox}
				onMouseDown={onMouseDown}
				data-name={name}
			/>
			<SVGLineCircle
				className={styleCircle}
				x={x}
				y={y}
			/>
		</>
	);
};

interface SVGPathLineProps extends HTMLAttributes<SVGPathElement> {
	points: Point[];
}

const SVGPathLine = ({ points, ...otherProps }: SVGPathLineProps) =>
	<path
		d={
			points
				.map(([x, y], i) => {
					const operation = i === 0 ? 'M' : 'L';
					return `${operation}${x} ${y}`;
				})
				.join(' ')
		}
		{...otherProps}
	/>;

// interface PointConfig {
// 	name?: ParamName;
// 	label: string;
// 	mapX: string;
// 	mapY: string | null;
// 	calculateX: pointCalculation;
// 	calculateY: pointCalculation;
// 	canvasControl: boolean;
// 	inputControl: boolean;
// 	width: number;
// }

// const pointsConfig: PointConfig[] = [
// 	{
// 		calculateX: () => 0,
// 		calculateY: () => 0,
// 		canvasControl: false,
// 		inputControl: false,
// 		// TODO: "start" is not in ParamName...
// 		width: 0,
// 	},
// 	{
// 		calculateY: () => 1,
// 		name: 'attack',
// 	},
// 	{
// 		calculateY: ({ sustain }) => sustain,
// 		mapY: 'sustain',
// 		name: 'decay',
// 	},
// 	{
// 		calculateX: () => 1,
// 		calculateY: getParamMultiplier(inputs, 'sustain'),
// 		canvasControl: false,
// 		name: 'sustain',
// 		width: 0.5,
// 	},
// 	{
// 		calculateY: () => 0,
// 		name: 'release',
// 	},
// ];

// ame = name;
// 		this.label = label || upperFirst(name);

// 		this.mapX = mapX || name;
// 		this.mapY = mapY || null;

// 		// TODO:
// 		this.calculateX = calculateX || getParamMultiplier(inputs, name);
// 		this.calculateY = calculateY;

// 		this.inputControl = inputControl;

// 		// TODO: Width is a bit confusing. Can it be incorporated into calculateX?
// 		this.width = width;
// 		this.inputs = inputs;

interface Param {
	getPoint(props: Props, lastPoint: Point): Point;
	mapToInput?: {
		x?: string;
		y?: string;
	};
	width: number;
}

const params: Param[] = [
	{
		getPoint: () => [MIDI_MIN, MIDI_MAX],
		width: 0,
	},
	{
		getPoint: ({ attack }) => [attack, MIDI_MIN],
		mapToInput: { x: 'attack' },
		width: 1,
	},
	{
		getPoint: ({ decay, sustain }, [lastX]) => [lastX + decay, MIDI_MAX - sustain],
		mapToInput: { x: 'decay', y: 'sustain' },
		width: 1,
	},
	{
		getPoint: ({ sustain }, [lastX]) => [lastX + (MIDI_MAX / 2), MIDI_MAX - sustain],
		width: 0.5,
	},
	{
		getPoint: ({ release }, [lastX]) => [lastX + release, MIDI_MAX],
		mapToInput: { x: 'release' },
		width: 1,
	},
];
const widthTotal = sumBy(params, 'width');
const inputs = flatMap(
	params,
	({ mapToInput }: Param) => mapToInput && Object.values(mapToInput),
).filter(name => !!name);

console.log(inputs);

const getParamPoints = (props: Props): Point[] =>
	params
		.reduce((points, { getPoint }) => {
			const lastPoint = last(points) || [0, 0];

			return points.concat([
				getPoint(props, lastPoint),
			]);
		}, [] as Point[])
		.map(([x, y]) => [
			scaleMidiValueToSVG(x) / widthTotal,
			scaleMidiValueToSVG(y),
		] as Point);

const InputADSRSimplified = (props: Props) => {
	const [currentParam, setCurrentParam] = useState(null as null | string);

	const points = getParamPoints(props);
	console.log(points);

	const onHitboxMouseDown = ({ target }: MouseEvent) => {
		console.log(target);
		const param = (target as HTMLElement).dataset.name;
		if (param) {
			setCurrentParam(param);
		}
	};

	// TODO: Can this pattern of registering event on document be broken out into its own hook?
	useEffect(() => {
		const clearCurrentParam = () => {
			setCurrentParam(null);
		};
		const onMouseMove = () => {
			console.log('hello?');
			if (currentParam) {
				console.log(currentParam);
			}
		};

		document.addEventListener('mouseup', clearCurrentParam);
		document.addEventListener('mousemove', onMouseMove);

		return () => {
			document.removeEventListener('mouseup', clearCurrentParam);
			document.removeEventListener('mousemove', onMouseMove);
		};
	}, []);

	return (
		<div className={styleWrapper}>
			<svg
				className={styleSvg}
				width='100%'
				height='300'
				viewBox={SVG_VIEWBOX}
				preserveAspectRatio='none'
			>
				<SVGPathLine className={styleSvgBase} points={points} />
				{/* TODO: Better handling of x / y values */}
				<SVGPoint onMouseDown={onHitboxMouseDown} name='attack' point={points[1]} />
				<SVGPoint onMouseDown={onHitboxMouseDown} name='decay' point={points[2]} />
				<SVGPoint onMouseDown={onHitboxMouseDown} name='release' point={points[4]} />
			</svg>
		</div>
	);
};

export default InputADSRSimplified;
