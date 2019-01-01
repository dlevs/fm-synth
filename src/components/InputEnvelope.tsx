import React, { useState, useRef, RefObject, useEffect } from 'react';
import { css } from 'emotion';
import Color from 'color';
import uniq from 'lodash/uniq';
import flatMap from 'lodash/flatMap';
import clamp from 'lodash/fp/clamp';
import { MIDI_MIN, MIDI_MAX, scaleMIDIValueBetween } from '../lib/scales';
import { getRelativeMouseCoordinates } from '../lib/eventUtils';
import { cumulativeX } from '../lib/pointUtils';
import { Point, ValueProps } from '../lib/types';
import { styleVisuallyHidden } from '../lib/utilityStyles';
import InputRange from './InputRange';
import useEventListener from '../hooks/useEventListener';
import SVGLineCircle from './SVGLineCircle';
import SVGPolyline from './SVGPolyline';
import useMouseStatus from '../hooks/useMouseStatus';
import useSize from '../hooks/useSize';

const clampBetween0And1 = clamp(0, 1);

interface Props <T> extends ValueProps<T> {
	divideWidth: number;
	pointsConfig: PointConfig[];
	color?: string;
}

const styleWrapper = css`
	padding: 12px;
`;

const styleSvg = (color: string) => css`
	user-select: none;
	display: block;
	overflow: visible;

	&[data-hover="true"] {
		cursor: grab;

		path, polyline {
			fill: ${Color(color).alpha(0.05).toString()};
		}
	}
`;

const styleSvgBase = (color: string) => css`
	vector-effect: non-scaling-stroke;
	stroke-width: 1;
	stroke: ${color};
	fill: none;
`;

const styleCircle = (color: string) => css`
	${styleSvgBase(color)}
	position: relative;
	z-index: 1;
	stroke-width: 6;

	&[data-active="true"] {
		stroke-width: 12;
	}
`;

export interface PointConfig {
	point: Point;
	mapX?: string;
	mapY?: string;
}

const getInteractivePoints = (pointsConfig: PointConfig[]) =>
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

export function getDivideWidth<T>(
	maxEnvelope: T,
	getPointsConfig: (envelope: T) => PointConfig[],
) {
	const maxPoints = getPointsConfig(maxEnvelope);
	const maxPointsCumulative = cumulativeX(maxPoints.map(({ point }) => point));
	const [maxX] = maxPointsCumulative[maxPointsCumulative.length - 1];
	return maxX / MIDI_MAX;
}

// TODO: Typing directly on the fn works in "withOwnState.tsx". Why not here?
type InputEnvelopeType = <T extends object>(props: Props<T>) => React.ReactElement<Props<T>>;

export const InputEnvelope: InputEnvelopeType = props => {
	// Props
	const { value, pointsConfig, onChange, divideWidth, color = '#444' } = props;

	// State
	const { isMouseDown, isMouseOver, mouseStatusProps } = useMouseStatus();

	// SVG wrapper element
	const svgWrapper = useRef(null as null | HTMLDivElement);
	const wrapper = useRef(null as null | HTMLDivElement);
	const { width, height } = useSize(svgWrapper);
	const scalePointToWidth = scaleMIDIValueBetween(0, width / divideWidth);
	const scalePointToHeight = scaleMIDIValueBetween(0, height);
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

		const [x, y] = getRelativeMouseCoordinates(event, svgWrapper.current).constrained;

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
		const changes: Partial<typeof value> = {};

		if (mapX) {
			const [minX] = points[pointIndex - 1] || [0, 0];
			const maxRangeX = width / divideWidth;
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
			...value,
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
						value={value[name]}
						min={MIDI_MIN}
						max={MIDI_MAX}
						inputRef={inputs[name]}
						onChange={({ target }) => {
							onChange({
								...value,
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
					className={styleSvg(color)}
					data-hover={activePointIndex != null}
					data-active={isInputFocused}
					width='100%'
					height='300'
					viewBox={`0 0 ${width} ${height}`}
					preserveAspectRatio='none'
				>
					<SVGPolyline className={styleSvgBase(color)} pointsArray={points} />
					{interactivePoints.map((pointMap, i) => (
						<SVGLineCircle
							key={i}
							data-active={i === activePointIndex}
							className={styleCircle(color)}
							point={points[pointMap.pointIndex]}
						/>
					))}
				</svg>
			</div>
		</div>
	);
};

export default InputEnvelope;
