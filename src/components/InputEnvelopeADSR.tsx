import React, { useState, useRef, RefObject, useEffect } from 'react';
import { css } from 'emotion';
import uniq from 'lodash/uniq';
import flatMap from 'lodash/flatMap';
import clamp from 'lodash/fp/clamp';
import { MIDI_MIN, MIDI_MAX, scaleMIDIValueBetween } from '../lib/scales';
import { getRelativeMouseCoordinates } from '../lib/eventUtils';
import { cumulativeX } from '../lib/pointUtils';
import { Point, ADSREnvelope } from '../lib/types';
import { styleVisuallyHidden } from '../lib/utilityStyles';
import InputRange from './InputRange';
import useEventListener from '../hooks/useEventListener';
import SVGLineCircle from './SVGLineCircle';
import SVGPathLine from './SVGPathLine';
import useMouseStatus from '../hooks/useMouseStatus';
import useSize from '../hooks/useSize';

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
	user-select: none;
	display: block;
	overflow: visible;

	&[data-hover="true"] {
		cursor: grab;

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

	&[data-active="true"] {
		stroke-width: 12;
	}
`;

// TODO: Explain this value and make better name
const WIDTH = 3.5;

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

const getPointInputs = (
	interactivePoints: ReturnType<typeof getInteractivePoints>,
): {[key: string]: RefObject<null | HTMLInputElement>} => {
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

const getClosestPointIndex = (points: Point[], [x, y]: Point) => {
	const distances = points.map(([x2, y2]) => Math.abs(x - x2) + Math.abs(y - y2));
	const distance = Math.min(...distances);

	return distances.indexOf(distance);
};

const InputEnvelopeADSR = (props: Props) => {
	// Props
	const { onChange } = props;

	// State
	const { isMouseDown, isMouseOver, mouseStatusProps } = useMouseStatus();

	// SVG wrapper element
	const svgWrapper = useRef(null as null | HTMLDivElement);
	const wrapper = useRef(null as null | HTMLDivElement);
	const { width, height } = useSize(svgWrapper);
	const scalePointToWidth = scaleMIDIValueBetween(0, width / WIDTH);
	const scalePointToHeight = scaleMIDIValueBetween(0, height);
	const pointsConfig = getPointsConfig(props);
	const points = cumulativeX(pointsConfig.map(({ point }) => point))
		.map(([x, y]): Point => [
			scalePointToWidth(x),
			scalePointToHeight(y),
		]);
	const interactivePoints = getInteractivePoints(pointsConfig);
	const inputs = getPointInputs(interactivePoints);
	const [activePointIndex, setActivePointIndexRaw] = useState(null as null | number);
	const setActivePointIndex = (index: null | number) => {
		if (activePointIndex !== index) {
			setActivePointIndexRaw(index);
		}
	};
	const getIsInputFocused = () => (
		wrapper.current &&
		wrapper.current.contains(document.activeElement)
	);
	const isInputFocused = getIsInputFocused();

	useEffect(() => {
		if (isMouseDown && activePointIndex != null) {
			const point = interactivePoints[activePointIndex];
			const inputName = point.mapX || point.mapY;

			if (inputName != null) {
				const relatedInput = inputs[inputName];
				if (relatedInput && relatedInput.current) {
					relatedInput.current.focus();
				}
			}
		}

		if (!isMouseDown && !isMouseOver && !getIsInputFocused()) {
			setActivePointIndex(null);
		}
	});

	// Ensure a re-render when size of window changes.

	// TODO: Tidy the rest

	const onMouseMove: EventListener = event => {
		if (!svgWrapper.current) {
			return;
		}

		const { x, y } = getRelativeMouseCoordinates(event, svgWrapper.current);

		// TODO: Moving mouse fast out of SVG area causes it to remain in active state. Do some of this logic outside of mousemove
		if (!isMouseDown && isMouseOver) {
			const hoveredPointIndex = getClosestPointIndex(
				interactivePoints.map(pointMap => points[pointMap.pointIndex]),
				[x, y],
			);

			setActivePointIndex(hoveredPointIndex);

			return;
		}

		if (activePointIndex === null || !isMouseDown) {
			return;
		}

		const { mapX, mapY, pointIndex } = interactivePoints[activePointIndex];
		const changes: Partial<ADSREnvelope> = {};

		if (mapX) {
			const [minX] = points[pointIndex - 1] || [0, 0];
			const maxRangeX = width / WIDTH;
			const ratioX = clampBetween0And1((x - minX) / maxRangeX);
			changes[mapX] = ratioX * MIDI_MAX;
		}

		if (mapY) {
			const ratioY = clampBetween0And1(y / height);
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

	useEventListener(document, 'mousemove', onMouseMove);

	return (
		<div
			className={styleWrapper}
			ref={wrapper}
			onBlur={(event) => {
				if (wrapper.current && !wrapper.current.contains(event.relatedTarget)) {
					setActivePointIndex(null)
				}
			}}
			onFocus={(event: FocusEvent) => {
				const { name } = event.target;
				const index = interactivePoints.findIndex(({ mapX, mapY }) => {
					return mapX === name || mapY === name;
				});

				if (index !== -1) {
					setActivePointIndex(index);
				}
			}}
			// Prevent default on click to not take focus away from input
			// elements being focused via JS for accessibility.
			onMouseDown={e => e.preventDefault()}
		>
			<div className={styleVisuallyHidden}>
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
								[name]: Number((target as HTMLInputElement).value),
							});
						}}
					/>
				))}
			</div>
			{/*
				A wrapper is needed for querying dimensions.
				We cannot query `.width` on an SVG directly in Firefox.
			*/}
			<div ref={svgWrapper} {...mouseStatusProps}>
				<svg
					className={styleSvg}
					data-hover={activePointIndex != null}
					data-active={isInputFocused}
					width='100%'
					height='300'
					viewBox={`0 0 ${width} ${height}`}
					preserveAspectRatio='none'
				>
					<SVGPathLine className={styleSvgBase} points={points} />
					{interactivePoints.map((pointMap, i) => (
						<SVGLineCircle
							key={i}
							data-active={i === activePointIndex}
							className={styleCircle}
							point={points[pointMap.pointIndex]}
						/>
					))}
				</svg>
			</div>
		</div>
	);
};

export default InputEnvelopeADSR;
