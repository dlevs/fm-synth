import React, { useState, useRef, RefObject, useEffect, Fragment } from 'react';
import uniq from 'lodash/uniq';
import flow from 'lodash/flow';
import flatMap from 'lodash/flatMap';
import clamp from 'lodash/fp/clamp';
import { MIDI_MIN, MIDI_MAX, scaleMIDIValueBetween } from '../lib/scales';
import { expandPointConfigs, cumulativeX } from '../lib/pointUtils';
import { Point, PointConfig } from '../lib/types';
import { styleVisuallyHidden } from '../lib/utilityStyles';
import InputRange2D, { Props as InputRange2DProps } from './InputRange2D';
import SVGLineCircle from './SVGLineCircle';
import SVGPolyline from './SVGPolyline';
import usePointerStatus, { defaultStatus } from '../hooks/usePointerStatus';
import useKeyboardStatus from '../hooks/useKeyboardStatus';
import useSize from '../hooks/useSize';

import * as style from './InputEnvelope.style';
import { InputEnvelopeType } from './InputEnvelope.types';

const clampBetween0And1 = clamp(0, 1);
const defaultPointConfig: Partial<PointConfig> = { point: [0, 0] };

const getClosestPointIndex = (
	points: ReturnType<typeof expandPointConfigs>,
	[x, y]: Point,
) => {
	const distances = points.map(({
		point,
		isInteractive,
	}) => {
		const [x2, y2] = point;
		return isInteractive
			? Math.abs(x - x2) + Math.abs(y - y2)
			: Number.POSITIVE_INFINITY;
	});
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

export const InputEnvelope: InputEnvelopeType = props => {
	// Props
	const {
		value,
		pointsConfig,
		onChange,
		divideWidth,
		color = '#444',
	} = props;
	const [activePointIndex, setActivePointIndex] = useState(-1);
	// const [status, setStatus] = useState(defaultStatus);
	const wrapper = useRef(null as null | HTMLDivElement);
	const svgWrapper = useRef(null as null | SVGSVGElement);
	const { width, height } = useSize(svgWrapper);
	const maxRangeX = width / divideWidth;
	const points = expandPointConfigs(
		pointsConfig,
		scaleMIDIValueBetween(0, maxRangeX),
		scaleMIDIValueBetween(0, height),
	);
	// TODO: Pls tidy all these floating variables...
	const { mapX, mapY } = points[activePointIndex] || defaultPointConfig;
	const [x, y] = (points[activePointIndex] || defaultPointConfig).point;
	const [minX] = (points[activePointIndex - 1] || defaultPointConfig).point;
	const getIsInputFocused = () => (
		wrapper.current &&
		wrapper.current.contains(document.activeElement)
	);
	const isInputFocused = getIsInputFocused();

	// State
	const keyboardStatus = useKeyboardStatus();
	const pointerStatusProps = usePointerStatus({
		wrapperRef: wrapper,
		relativeToRef: svgWrapper,
		// Prevent default on click to not take focus away from input
		// elements being focused via JS for accessibility.
		onRawEvent: event => event.preventDefault(),
		onStatusChange: status => {
			// setStatus(status);

			if (status.value === 'inactive') {
				setActivePointIndex(-1);
			}
		},
		onPointChange: (point, nextStatus) => {
			switch (nextStatus.value) {
				case 'hover': {
					const hoveredPointIndex = getClosestPointIndex(points, point.constrained);
					setActivePointIndex(hoveredPointIndex);
					break;
				}

				case 'active': {
					if (activePointIndex === -1) {
						return;
					}
					const [x, y] = point.constrained;
					const { mapX, mapY } = points[activePointIndex];
					const changes: Partial<typeof value> = {};
					const isFineTune = keyboardStatus.shiftKey;

					if (mapX) {
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

	useEffect(() => {
		if (status.isActive && activePointIndex !== -1) {
			const point = points[activePointIndex];
			const inputName = point.mapX || point.mapY;

			if (inputName != null) {
				// const relatedInput = inputs[inputName];
				// if (relatedInput && relatedInput.current) {
				// 	relatedInput.current.focus();
				// }
			}
		}
	});

	return (
		<div
			className={style.wrapper}
			ref={wrapper}
			onBlur={(event) => {
				if (wrapper.current && !wrapper.current.contains(event.relatedTarget)) {
					setActivePointIndex(-1);
				}
			}}
			onFocus={(event: FocusEvent) => {
				const { name } = event.target
				const index = points.findIndex(({ mapX, mapY }) => {
					return mapX === name || mapY === name;
				});
				setActivePointIndex(index);
			}}
			{...pointerStatusProps}
		>
			<div className={styleVisuallyHidden}>
				{points.map(({
					mapX,
					mapY,
					isInteractive,
					interactiveKey,
				}) => {
					if (!isInteractive) {
						return null;
					}

					return (
						<InputRange2D
							key={interactiveKey}
							xProps={!mapX ? undefined : {
								value: value[mapX],
								label: mapX,
								name: mapX,
								onChange: newValue => onChange({ ...value, [mapX]: newValue }),
							}}
							yProps={!mapY ? undefined : {
								value: value[mapY],
								label: mapY,
								name: mapY,
								onChange: newValue => onChange({ ...value, [mapY]: newValue }),
							}}
							min={MIDI_MIN}
							max={MIDI_MAX}
							// step={step}
							// inputRef={inputs[name]}
						/>
					);
				})}
			</div>
			{/*
				A wrapper is needed for querying dimensions.
				We cannot query `.width` on an SVG directly in Firefox.
			*/}
			<div ref={svgWrapper}>
				<svg
					className={style.svg}
					width='100%'
					height='300'
					viewBox={`0 0 ${width} ${height}`}
					preserveAspectRatio='none'
				>
					<SVGPolyline
						className={style.svgBase(color)}
						pointsArray={points.map(({ point }) => point)}
					/>
					{activePointIndex !== -1 && (
						<rect
							x={minX}
							y={mapY ? 0 : y - (style.dotSizeActive / 2)}
							width={maxRangeX}
							height={mapY ? height : style.dotSizeActive}
							className={style.rangeGuideBox(color)}
						/>
					)}
					{points.map((config, i) => {
						if (!config.isInteractive) {
							return null;
						}

						return (
							<SVGLineCircle
								key={config.interactiveKey}
								data-active={i === activePointIndex}
								className={style.circle(color)}
								point={config.point}
							/>
						);
					})}
				</svg>
			</div>
		</div>
	);
};

export default InputEnvelope;
