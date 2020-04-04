import { useState, useRef } from 'react'
import { useAutoCallback, useAutoEffect } from 'hooks.macro'
import { clamp } from 'lodash-es'
import { MIDI_MIN, MIDI_MAX, scaleMIDIValueBetween } from '../lib/scales.js'
import { getClosestPointIndex, expandPointConfigs, cumulativeX } from '../lib/pointUtils.js'
import { Point, PointConfig } from '../lib/types.js'
import { styleVisuallyHidden } from '../lib/utilityStyles.js'
import InputRange2D from './InputRange2D.js'
import SVGLineCircle from './SVGLineCircle.js'
import SVGPolyline from './SVGPolyline.js'
import usePointerStatus, { defaultPoint } from '../hooks/usePointerStatus.js'
import useKeyboardStatus from '../hooks/useKeyboardStatus.js'
import useMultiRef from '../hooks/useMultiRef.js'
import useSize from '../hooks/useSize.js'

import * as style from './InputEnvelope.style.js'
import { InputEnvelopeType } from './InputEnvelope.types'

const clampInMIDIRange = (n: number) => clamp(n, MIDI_MIN, MIDI_MAX)
const clampBetween0And1 = (n: number) => clamp(n, 0, 1)
const defaultPointConfig: Partial<PointConfig> = { point: [0, 0] }
const getInteractivePoints = ({
	isInteractive,
	point
}: {
	isInteractive: boolean;
	point: Point;
}) => isInteractive ? point : null

export function getDivideWidth<T> (
	maxEnvelope: T,
	getPointsConfig: (envelope: T) => PointConfig[]
) {
	const maxPoints = getPointsConfig(maxEnvelope)
	const maxPointsCumulative = cumulativeX(maxPoints.map(({ point }) => point))
	const [maxX] = maxPointsCumulative[maxPointsCumulative.length - 1]
	return maxX / MIDI_MAX
}

const getValueFromPoint = (
	value: number,
	minValue: number,
	range: number
) => {
	const ratio = clampBetween0And1((value - minValue) / range)
	return clampInMIDIRange(ratio * MIDI_MAX)
}

// TODO: Typing directly on the fn works in "withOwnState.tsx". Why not here?
// TODO: This component is not just about Envelopes anymore (InputRangeLine). Rename.
export const InputEnvelope: InputEnvelopeType = props => {
	// Props
	const {
		value,
		setValue,
		labels,
		pointsConfig,
		divideWidth,
		color = '#444',
		guides
	} = props
	const wrapper = useRef(null as null | HTMLDivElement)
	const svgWrapper = useRef(null as null | HTMLDivElement)
	const pointRefs = useMultiRef<HTMLInputElement>()
	const { width, height } = useSize(svgWrapper)
	const maxRangeX = width / divideWidth
	const points = expandPointConfigs(
		pointsConfig,
		scaleMIDIValueBetween(0, maxRangeX),
		scaleMIDIValueBetween(0, height)
	).map((config, i) => ({
		...config,
		ref: pointRefs[i]
	}))
	const [activePointIndex, setActivePointIndex] = useState(-1)
	const activePointConfig = points[activePointIndex]
		? points[activePointIndex]
		: null
	const previousPointConfig = points[activePointIndex - 1] || defaultPointConfig
	const [minX] = previousPointConfig.point

	/** TODO: Test comment. Foo bar. Add comments to this file and tidy. */
	const activePointStart = useRef({
		prev: defaultPoint.unconstrained,
		click: defaultPoint.unconstrained
	})
	const hoverPoint = useRef(defaultPoint.unconstrained)

	const { shiftKey: isFineTune } = useKeyboardStatus()
	const lastIsFineTune = useRef(isFineTune)

	// Update the reference point when sensitivity changes
	useAutoEffect(() => {
		if (!activePointConfig) return
		if (isFineTune === lastIsFineTune.current) return

		activePointStart.current = {
			prev: activePointConfig.point,
			click: hoverPoint.current
		}
		lastIsFineTune.current = isFineTune
	})

	const onPointerStatusChange = useAutoCallback(({
		point,
		status,
		previousStatus,
		event
	}) => {
		// Prevent default on click to not take focus away from input
		// elements being focused via JS for accessibility.
		event.preventDefault()

		hoverPoint.current = point.unconstrained

		const [x, y] = point.unconstrained
		const sensitivity = isFineTune ? 4 : 1

		if (status !== previousStatus) {
			switch (status) {
				case 'inactive':
					setActivePointIndex(-1)
					break

				case 'active':
					if (activePointConfig && activePointConfig.ref.current) {
						activePointConfig.ref.current.focus()
					}
					break
			}
		}

		switch (status) {
			case 'hover': {
				const hoveredPointIndex = getClosestPointIndex(
					points.map(getInteractivePoints),
					point.constrained
				)
				setActivePointIndex(hoveredPointIndex)
				break
			}

			case 'active': {
				if (!activePointConfig) return

				const { mapX, mapY } = activePointConfig
				const changes: Partial<typeof value> = {}

				if (previousStatus !== 'active') {
					activePointStart.current = {
						prev: activePointConfig.point,
						click: point.unconstrained
					}
				} else {
					const {
						prev: [xPrev, yPrev],
						click: [xClick, yClick]
					} = activePointStart.current

					if (mapX) {
						const difference = (x - xClick) / sensitivity
						const offsetted = xPrev + difference

						changes[mapX] = getValueFromPoint(offsetted, minX, maxRangeX)
					}

					if (mapY) {
						const difference = (y - yClick) / sensitivity
						const offsetted = yPrev + difference

						changes[mapY] = MIDI_MAX - getValueFromPoint(offsetted, 0, height)
					}

					if (!(mapX || mapY)) return

					setValue({
						...value,
						...changes
					})
				}
			}
		}
	})

	// TODO: Performance is very bad in IOS Safari due to adding and removing event
	// listeners since `onPointerStatusChange` deps change too often. Refactor.
	const pointerStatusProps = usePointerStatus({
		wrapperRef: wrapper,
		relativeToRef: svgWrapper,
		onChange: onPointerStatusChange
	})

	return (
		<div
			css={style.wrapper}
			ref={wrapper}
			onBlur={event => {
				if (!wrapper.current) return
				if (wrapper.current.contains(event.relatedTarget as Element)) return

				setActivePointIndex(-1)
			}}
			onFocus={event => {
				if (!(event.target instanceof HTMLInputElement)) return

				const { name } = event.target
				const index = points.findIndex(({ mapX, mapY }) => {
					return mapX === name || mapY === name
				})
				setActivePointIndex(index)
			}}
			{...pointerStatusProps}
		>
			<div css={styleVisuallyHidden}>
				{points.map((config, i) => {
					const {
						mapX,
						mapY,
						isInteractive,
						interactiveKey,
						ref
					} = config
					if (!isInteractive) {
						return null
					}

					const createSetValue = (key: string) =>
						(newValue: number) => {
							// Set the index, for the rare edge case that a user has an input
							// field focused, then moves hover away from this component and
							// uses the arrow keys to change the value of the still-focused
							// field.
							if (activePointIndex !== i) {
								setActivePointIndex(i)
							}

							setValue({
								...value,
								[key]: clampInMIDIRange(newValue)
							})
						}

					return (
						<InputRange2D
							ref={ref}
							key={interactiveKey}
							xProps={!mapX ? undefined : {
								value: value[mapX],
								label: labels[mapX],
								name: mapX,
								setValue: createSetValue(mapX)
							}}
							yProps={!mapY ? undefined : {
								value: value[mapY],
								label: labels[mapY],
								name: mapY,
								setValue: createSetValue(mapY)
							}}
							min={MIDI_MIN}
							max={MIDI_MAX}
							step={isFineTune ? 1 : 3}
						/>
					)
				})}
			</div>
			{/*
				A wrapper is needed for querying dimensions.
				We cannot query `.width` on an SVG directly in Firefox.
			*/}
			<div ref={svgWrapper}>
				<svg
					css={style.svg}
					width='100%'
					height='300'
					viewBox={`0 0 ${width} ${height}`}
					preserveAspectRatio='none'
				>
					<SVGPolyline
						css={style.svgBase(color)}
						pointsArray={points.map(({ point }) => point)}
					/>
					{guides && activePointConfig && (
						<rect
							x={previousPointConfig.point[0]}
							y={
								activePointConfig.mapY
									? 0
									: activePointConfig.point[1] - (style.dotSizeActive / 2)
							}
							width={maxRangeX}
							height={activePointConfig.mapY ? height : style.dotSizeActive}
							css={style.rangeGuideBox(color)}
						/>
					)}
					{points.map((config, i) => {
						if (!config.isInteractive) {
							return null
						}

						return (
							<SVGLineCircle
								key={config.interactiveKey}
								data-active={i === activePointIndex}
								css={style.circle(color)}
								point={config.point}
							/>
						)
					})}
				</svg>
			</div>
		</div>
	)
}

export default InputEnvelope
