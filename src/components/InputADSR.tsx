import React, { useState, useRef } from 'react';
import { css } from 'emotion';
import uniq from 'lodash/uniq';
import flatMap from 'lodash/flatMap';
import clamp from 'lodash/fp/clamp';
import { MIDI_MIN, MIDI_MAX, SVG_VIEWBOX, scaleMidiValueToSVG } from '../lib/scales';
import { getRelativeMouseCoordinates } from '../lib/eventUtils';
import { cumulativeX } from '../lib/pointUtils';
import { Point, ADSREnvelope } from '../lib/types';
import InputRange from './InputRange';
import useEventListener from '../hooks/useEventListener';
import SVGLineCircle from './SVGLineCircle';
import SVGPathLine from './SVGPathLine';
import useMouseStatus from '../hooks/useMouseStatus';

const clampBetween0And1 = clamp(0, 1);

const pickADSRProps = ({ attack, decay, sustain, release }: ADSREnvelope) =>
	({ attack, decay, sustain, release });

interface Props extends ADSREnvelope {
	onChange(value: ADSREnvelope): void;
}

const styleWrapper = css`
	padding: 12px;
`;

const styleSvg = css`
	overflow: visible;
	/* filter: drop-shadow(0 0 5px #000); */

	&[data-hover="true"] {
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

const styleCircle = css`
	${styleSvgBase}
	position: relative;
	z-index: 1;
	stroke-width: 6;
	cursor: grab;

	&:hover,
	&:active + & {
		stroke-width: 12;
	}
`;

interface PointMap {
	pointIndex: number;
	mapX?: string | null;
	mapY?: string | null;
}

// TODO: Explain this value and make better name
const WIDTH = 3.5;
// TODO: Name makes no sense
const WIDTH_MAX = WIDTH * MIDI_MAX;

interface PointConfig {
	point: Point;
	mapX?: string;
	mapY?: string;
}

const getPointsConfig = ({ attack, decay, sustain, release }: ADSREnvelope): PointConfig[] => [
	{
		point: [MIDI_MIN, MIDI_MAX],
	},
	{
		point: [attack, MIDI_MIN],
		mapX: 'attack',
	},
	{
		point: [decay, MIDI_MAX - sustain],
		mapX: 'decay',
		mapY: 'sustain',
	},
	{
		point: [MIDI_MAX / 2, MIDI_MAX - sustain],
	},
	{
		point: [release, MIDI_MAX],
		mapX: 'release',
	},
];
const getInteractivePoints = (pointsConfig: ReturnType<typeof getPointsConfig>) =>
	pointsConfig
		.map(({ mapX, mapY }, pointIndex) => ({ mapX, mapY, pointIndex }))
		.filter(({ mapX, mapY }) => mapX || mapY);

const getPointInputs = (interactivePoints: ReturnType<typeof getInteractivePoints>) => {
	const inputNames = flatMap(
		interactivePoints,
		({ mapX, mapY }) => [mapX, mapY],
	).filter(
		value => typeof value === 'string',
	) as string[];

	return uniq(inputNames).reduce((accum, name) => ({
		...accum,
		[name]: useRef(null as null | HTMLInputElement),
	}), {});
};

const InputADSR = (props: Props) => {
	const { onChange } = props;
	const [currentPointMap, setCurrentPointMap] = useState(null as null | PointMap);
	const { isMouseDown, isMouseOver, mouseStatusProps } = useMouseStatus();
	const pointsConfig = getPointsConfig(props);
	const interactivePoints = getInteractivePoints(pointsConfig);
	const inputs = getPointInputs(interactivePoints);

	const pointsMIDI = cumulativeX(pointsConfig.map(({ point }) => point));
	// TODO: ...
	const points = pointsMIDI.map(([x, y]) => [
		scaleMidiValueToSVG(x) / WIDTH,
		scaleMidiValueToSVG(y),
	] as Point);
	const svgWrapper = useRef(null as null | HTMLDivElement);
	const clearCurrentParam = () => {
		setCurrentPointMap(null);
	};
	const onMouseMove: EventListener = event => {
		if (!currentPointMap || !svgWrapper.current) {
			return;
		}

		const { clientWidth, clientHeight } = svgWrapper.current;
		const { mapX, mapY, pointIndex } = currentPointMap;
		const changes: Partial<ADSREnvelope> = {};
		const { x, y } = getRelativeMouseCoordinates(event, svgWrapper.current);

		if (mapX) {
			const scaleX = clientWidth / WIDTH_MAX;
			const [minX] = pointsMIDI[pointIndex - 1] || [0, 0];
			const maxRangeX = clientWidth / WIDTH;
			const ratioX = clampBetween0And1((x - (minX * scaleX)) / maxRangeX);
			changes[mapX] = ratioX * MIDI_MAX;
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
			{Object.keys(inputs).map(name => (
				<InputRange
					key={name}
					label={name}
					name={name}
					value={props[name]}
					min={MIDI_MIN}
					max={MIDI_MAX}
					inputRef={inputs[name]}
					onChange={({ target }) => {
						onChange({
							...pickADSRProps(props),
							[name]: Number(target.value),
						});
					}}
				/>
			))}
			{/*
				A wrapper is needed for querying dimensions.
				We cannot query `.clientWidth` on an SVG directly in Firefox.
			*/}
			<div ref={svgWrapper} {...mouseStatusProps}>
				<svg
					className={styleSvg}
					data-hover={isMouseOver || isMouseDown}
					data-active={isMouseDown}
					width='100%'
					height='300'
					viewBox={SVG_VIEWBOX}
					preserveAspectRatio='none'
				>
					<SVGPathLine className={styleSvgBase} points={points} />
					{interactivePoints.map((pointMap, i) => (
						<SVGLineCircle
							key={i}
							className={styleCircle}
							point={points[pointMap.pointIndex]}
							onMouseDown={() => setCurrentPointMap(pointMap)}
						/>
					))}
				</svg>
			</div>
		</div>
	);
};

export default InputADSR;
