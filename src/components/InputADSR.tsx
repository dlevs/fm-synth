import React, { useState, HTMLAttributes, useRef } from 'react';
import { css } from 'emotion';
import clamp from 'lodash/fp/clamp';
import { MIDI_MIN, MIDI_MAX, SVG_VIEWBOX, scaleMidiValueToSVG } from '../lib/scales';
import { getRelativeMouseCoordinates } from '../lib/eventUtils';
import { cumulativeX } from '../lib/pointUtils';
import { Point, ADSREnvelope } from '../lib/types';
import InputRange from './InputRange';
import useEventListener from '../hooks/useEventListener';
import SVGLineCircle from './SVGLineCircle';
import SVGPathLine from './SVGPathLine';

const clampBetween0And1 = clamp(0, 1);

const pickADSRProps = ({ attack, decay, sustain, release }: ADSREnvelope) =>
	({ attack, decay, sustain, release });

interface Props extends ADSREnvelope {
	onChange(value: ADSREnvelope): void;
}

interface SVGPointProps extends HTMLAttributes<SVGLineElement> {
	point: Point;
}

const styleWrapper = css`
	padding: 12px;
`;

const styleSvg = css`
	overflow: visible;
	/* filter: drop-shadow(0 0 5px #000); */

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

// TODO: We won't need a hitbox soon. Can we remove this component?
const SVGPoint = ({ point, onMouseDown }: SVGPointProps) => (
	<>
		<SVGLineCircle
			point={point}
			className={styleHitbox}
			onMouseDown={onMouseDown}
		/>
		<SVGLineCircle
			className={styleCircle}
			point={point}
		/>
	</>
);

interface PointMap {
	pointIndex: number;
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
		scaleMidiValueToSVG(x) / WIDTH,
		scaleMidiValueToSVG(y),
	] as Point);
	const svgWrapper = useRef(null as null | HTMLDivElement);
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
		if (!pointMap || !svgWrapper.current) {
			return;
		}

		const { clientWidth, clientHeight } = svgWrapper.current;
		const { mapX, mapY, pointIndex } = pointMap;
		const changes: Partial<ADSREnvelope> = {};
		const { x, y } = getRelativeMouseCoordinates(event, svgWrapper.current);

		if (mapX) {
			const scaleX = clientWidth / WIDTH_MAX;
			const [minX] = pointsMIDI[pointIndex - 1] || [0, 0];

			const maxRangeX = clientWidth / WIDTH;

			const ratioX = clampBetween0And1((x - (minX * scaleX)) / maxRangeX);

			changes[mapX] = ratioX * MIDI_MAX;
			console.log(clientWidth, WIDTH);

		}

		if (mapY) {
			const ratioY = clampBetween0And1(y / clientHeight);
			changes[mapY] = MIDI_MAX - (ratioY * MIDI_MAX);
		}

		if (!(mapX || mapY)) {
			return;
		}

		onChange({
			...pickADSRProps(props),
			...changes,
		});
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
			{/*
				A wrapper is needed for querying dimensions.
				We cannot query `.clientWidth` on an SVG directly in Firefox.
			*/}
			<div ref={svgWrapper}>
				<svg
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
		</div>
	);
};

export default InputADSR;
