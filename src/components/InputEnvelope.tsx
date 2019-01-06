import React, { useState, useRef, RefObject, useEffect } from 'react';
import { css } from 'emotion';
import Color from 'color';
import uniq from 'lodash/uniq';
import flatMap from 'lodash/flatMap';
import clamp from 'lodash/fp/clamp';
import { MIDI_MIN, MIDI_MAX, scaleMIDIValueBetween } from '../lib/scales';
import { cumulativeX } from '../lib/pointUtils';
import { Point, ValueProps } from '../lib/types';
import { styleVisuallyHidden } from '../lib/utilityStyles';
import InputRange from './InputRange';
import SVGLineCircle from './SVGLineCircle';
import SVGPolyline from './SVGPolyline';
import usePointerStatus, { defaultStatus } from '../hooks/usePointerStatus';
import useKeyboardStatus from '../hooks/useKeyboardStatus';
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

const styleSvg = css`
	display: block;
	overflow: visible;
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

const styleSVGWrapper = (color: string) => css`
	cursor: grab;
	user-select: none;
	touch-action: none;

	&:not([data-status="inactive"]) {
		${styleSvg} {
			path, polyline {
				fill: ${Color(color).alpha(0.05).toString()};
			}
		}
	}

	&[data-status="active"] {
		cursor: grabbing;
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
// type InputEnvelopeType = <T extends object>(props: Props<T>) => React.ReactElement<Props<T>>;

export const InputEnvelope: InputEnvelopeType = props => {
	// Props
	const { value, pointsConfig, onChange, divideWidth, color = '#444' } = props;

	const [activePointIndex, setActivePointIndexRaw] = useState(null as null | number);
	const [status, setStatus] = useState(defaultStatus);

	// State
	const keyboardStatus = useKeyboardStatus();
	const pointerStatusProps = usePointerStatus({
		onStatusChange: status => {
			setStatus(status);

			if (status.value === 'inactive') {
				setActivePointIndex(null);
			}
		},
		onPointChange: (point, nextStatus) => {
			switch (nextStatus.value) {
				case 'hover': {
					const hoveredPointIndex = getClosestPointIndex(
						interactivePoints.map(pointMap => points[pointMap.pointIndex]),
						point.constrained,
					);

					setActivePointIndex(hoveredPointIndex);
					break;
				}

				case 'active': {
					if (activePointIndex === null) {
						return;
					}
					const [x, y] = point.constrained;
					const { mapX, mapY, pointIndex } = interactivePoints[activePointIndex];
					const changes: Partial<typeof value> = {};
					const isFineTune = keyboardStatus.shiftKey;

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
					break;
				}
			}
		},
	});

	// SVG wrapper element
	const svgWrapper = pointerStatusProps.ref;
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
		if (status.isActive && activePointIndex != null) {
			const point = interactivePoints[activePointIndex];
			const inputName = point.mapX || point.mapY;

			if (inputName != null) {
				const relatedInput = inputs[inputName];
				if (relatedInput && relatedInput.current) {
					relatedInput.current.focus();
				}
			}
		}
	});

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
			<div className={styleSVGWrapper(color)} {...pointerStatusProps}>
				<svg
					className={styleSvg}
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
