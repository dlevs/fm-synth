import React, { useState, HTMLAttributes, useRef } from 'react';
import last from 'lodash/last';
import clamp from 'lodash/fp/clamp';
// import map from 'lodash/fp/map';
import { css } from 'emotion';
import InputRange from './InputRange';
import { visuallyHidden } from '../lib/utilityStyles';
import { MIDI_MIN, MIDI_MAX, SVG_VIEWBOX, scaleMidiValueToSVG } from '../lib/scales';
import { getRelativeMouseCoordinates } from '../lib/eventUtils';
import { ADSREnvelope } from '../lib/types';
import useEventListener from '../hooks/useEventListener';

const clampBetween0And1 = clamp(0, 1);

const pickADSRProps = ({ attack, decay, sustain, release }: ADSREnvelope) =>
	({ attack, decay, sustain, release });

// TODO: Move me
type Point = [number, number];
// type ParamName = 'attack' | 'decay' | 'sustain' | 'release';

interface Props extends ADSREnvelope {
	onChange(value: ADSREnvelope): void;
}

interface SVGPointProps extends HTMLAttributes<SVGLineElement> {
	point: Point;
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

	.${styleHitbox}:hover + &,
	.${styleHitbox}:active + & {
		stroke-width: 12;
	}
`;

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
const SVGPoint = ({ point, onMouseDown }: SVGPointProps) => {
	const [x, y] = point;

	return (
		<>
			<SVGLineCircle
				x={x}
				y={y}
				className={styleHitbox}
				onMouseDown={onMouseDown}
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

const cumulativeX = (points: Point[]) => points
	.reduce((accum, [x, y]) => {
		const [lastX] = last(accum) || [0, 0];
		return [
			...accum,
			[x + lastX, y],
		] as Point[];
	}, [] as Point[]);

interface PointMap {
	pointIndex?: number;
	mapX?: string | null;
	mapY?: string | null;
}

// TODO: Explain this value and make better name
const WIDTH = 3.5;
// TODO: Name makes no sense
const WIDTH_MAX = WIDTH * MIDI_MAX;

const InputADSR = (props: Props) => {
	const { attack, decay, sustain, release, onChange } = props;
	const [pointMap, setPointMap] = useState(null as null | PointMap);
	const pointsMIDI = cumulativeX([
		[MIDI_MIN, MIDI_MAX],
		[attack, MIDI_MIN],
		[decay, MIDI_MAX - sustain],
		[MIDI_MAX / 2, MIDI_MAX - sustain],
		[release, MIDI_MAX],
	]);
	// TODO: ...
	const points = pointsMIDI.map(([x, y]) => [
		// TODO: Defined this magic number
		scaleMidiValueToSVG(x) / WIDTH,
		scaleMidiValueToSVG(y),
	] as Point);
	const svg = useRef(null as null | SVGSVGElement);
	const inputs = {
		attack: useRef(null as null | HTMLInputElement),
		decay: useRef(null as null | HTMLInputElement),
		sustain: useRef(null as null | HTMLInputElement),
		release: useRef(null as null | HTMLInputElement),
	};
	const clearCurrentParam = () => {
		setPointMap(null);
	};
	const onMouseMove: EventListener = event => {
		if (pointMap && svg.current) {
			const { clientWidth, clientHeight } = svg.current;
			const { mapX, mapY, pointIndex } = pointMap;
			const changes: Partial<ADSREnvelope> = {};
			const { x, y } = getRelativeMouseCoordinates(event, svg.current);

			if (mapX) {
				const scaleX = clientWidth / WIDTH_MAX;
				const minX = pointIndex != null
					? (pointsMIDI[pointIndex - 1] || [0, 0])[0]
					:	0;
				const maxRangeX = clientWidth / WIDTH;
				const ratioX = clampBetween0And1((x - (minX * scaleX)) / maxRangeX);

				changes[mapX] = ratioX * MIDI_MAX;
			}

			if (mapY) {
				const ratioY = clampBetween0And1(y / clientHeight);
				changes[mapY] = MIDI_MAX - (ratioY * MIDI_MAX);
			}

			if (mapX || mapY) {
				onChange({
					...pickADSRProps(props),
					...changes,
				});
			}
		}
	};

	useEventListener(document, 'mouseup', clearCurrentParam);
	useEventListener(document, 'mousemove', onMouseMove);

	return (
		<div className={styleWrapper}>
			{Object.keys(inputs).map(key => (
				<InputRange
					key={key}
					label={key}
					name={key}
					value={props[key]}
					min={MIDI_MIN}
					max={MIDI_MAX}
					inputRef={inputs[key]}
					onChange={({ target }) => {
						onChange({
							...pickADSRProps(props),
							[target.name]: Number(target.value),
						});
					}}
				/>
			))}
			<svg
				ref={svg}
				className={styleSvg}
				width='100%'
				height='300'
				viewBox={SVG_VIEWBOX}
				preserveAspectRatio='none'
			>
				<SVGPathLine className={styleSvgBase} points={points} />
				<SVGPoint
					point={points[1]}
					onMouseDown={() => setPointMap({
						pointIndex: 1,
						mapX: 'attack',
					})}
				/>
				<SVGPoint
					point={points[2]}
					onMouseDown={() => setPointMap({
						pointIndex: 2,
						mapX: 'decay',
						mapY: 'sustain',
					})}
				/>
				<SVGPoint
					point={points[4]}
					onMouseDown={() => setPointMap({
						pointIndex: 4,
						mapX: 'release',
					})}
				/>
			</svg>
		</div>
	);
};

export default InputADSR;
