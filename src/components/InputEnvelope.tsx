import React, { useState, useRef, RefObject, useEffect, Fragment } from 'react'
import uniq from 'lodash/uniq'
import flow from 'lodash/flow'
import flatMap from 'lodash/flatMap'
import clamp from 'lodash/fp/clamp'
import { MIDI_MIN, MIDI_MAX, scaleMIDIValueBetween } from '../lib/scales'
import { getClosestPointIndex, expandPointConfigs, cumulativeX } from '../lib/pointUtils'
import { Point, PointConfig } from '../lib/types'
import { styleVisuallyHidden } from '../lib/utilityStyles'
import InputRange2D, { Props as InputRange2DProps } from './InputRange2D'
import SVGLineCircle from './SVGLineCircle'
import SVGPolyline from './SVGPolyline'
import usePointerStatus, { defaultStatus, defaultPoint } from '../hooks/usePointerStatus'
import useKeyboardStatus from '../hooks/useKeyboardStatus'
import useSize from '../hooks/useSize'

import * as style from './InputEnvelope.style'
import { InputEnvelopeType } from './InputEnvelope.types'

const clampBetween0And1 = clamp(0, 1)
const defaultPointConfig: Partial<PointConfig> = { point: [0, 0] }

export function getDivideWidth<T> (
	maxEnvelope: T,
	getPointsConfig: (envelope: T) => PointConfig[]
) {
	const maxPoints = getPointsConfig(maxEnvelope)
	const maxPointsCumulative = cumulativeX(maxPoints.map(({ point }) => point))
	const [maxX] = maxPointsCumulative[maxPointsCumulative.length - 1]
	return maxX / MIDI_MAX
}

// TODO: Typing directly on the fn works in "withOwnState.tsx". Why not here?

export const InputEnvelope: InputEnvelopeType = props => {
	// Props
	const {
		value,
		pointsConfig,
		onChange,
		divideWidth,
		color = '#444'
	} = props
	// const [status, setStatus] = useState(defaultStatus);
	const wrapper = useRef(null as null | HTMLDivElement)
	const svgWrapper = useRef(null as null | SVGSVGElement)
	const { width, height } = useSize(svgWrapper)
	const maxRangeX = width / divideWidth
	const points = expandPointConfigs(
		pointsConfig,
		scaleMIDIValueBetween(0, maxRangeX),
		scaleMIDIValueBetween(0, height)
	).map(config => ({
		...config,
		ref: useRef(null as null | HTMLInputElement)
	}))
	const activePointStart = useRef(null as null | Point)
	const [activePointIndex, setActivePointIndex] = useState(-1)
	const activePointConfig = points[activePointIndex]
		? points[activePointIndex]
		: null
	const previousPointConfig = points[activePointIndex - 1] || defaultPointConfig

	// State
	const keyboardStatus = useKeyboardStatus()
	const isFineTune = keyboardStatus.shiftKey

	const pointerStatusProps = usePointerStatus({
		wrapperRef: wrapper,
		relativeToRef: svgWrapper,
		onChange: ({
			point: { constrained: [x, y] },
			status,
			previousStatus,
			event
		}) => {
			// Prevent default on click to not take focus away from input
			// elements being focused via JS for accessibility.
			event.preventDefault()

			if (status !== previousStatus) {
				switch (status) {
					case 'inactive':
						setActivePointIndex(-1)
						break

					case 'active':
						activePointStart.current = [x, y]
						if (activePointConfig && activePointConfig.ref.current) {
							activePointConfig.ref.current.focus()
						}
						break
				}
			}

			switch (status) {
				case 'hover': {
					const hoveredPointIndex = getClosestPointIndex(
						points.map(({ isInteractive, point }) => {
							return isInteractive ? point : null
						}),
						[x, y]
					)
					setActivePointIndex(hoveredPointIndex)
					break
				}

				case 'active': {
					if (!activePointConfig) return

					const { mapX, mapY } = activePointConfig
					const changes: Partial<typeof value> = {}
					const [minX] = previousPointConfig.point
					// TODO: Variable for these magic numbers:
					const fineTuneDivisor = isFineTune ? 3 : 1

					console.log(`The initial point was ${activePointStart.current}`)

					if (mapX) {
						const ratioXBase = ((x - minX) / maxRangeX) / fineTuneDivisor
						const ratioX = clampBetween0And1(ratioXBase)
						changes[mapX] = ratioX * MIDI_MAX
					}

					if (mapY) {
						const ratioYBase = (y / height) / fineTuneDivisor
						const ratioY = clampBetween0And1(ratioYBase)
						changes[mapY] = MIDI_MAX - (ratioY * MIDI_MAX)
					}

					if (!(mapX || mapY)) {
						return
					}

					onChange({
						...value,
						...changes
					})
					break
				}
			}
		}
	})

	return (
		<div
			className={style.wrapper}
			ref={wrapper}
			onBlur={(event) => {
				if (wrapper.current && !wrapper.current.contains(event.relatedTarget)) {
					setActivePointIndex(-1)
				}
			}}
			onFocus={(event: FocusEvent) => {
				const { name } = event.target
				const index = points.findIndex(({ mapX, mapY }) => {
					return mapX === name || mapY === name
				})
				setActivePointIndex(index)
			}}
			{...pointerStatusProps}
		>
			<div className={styleVisuallyHidden}>
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

					const createOnChange = (key: string) =>
						(newValue: number) => {
							// Set the index, for the rare edge case that a user has an input
							// field focused, then moves hover away from this component and
							// uses the arrow keys to change the value of the still-focused
							// field.
							if (activePointIndex !== i) {
								setActivePointIndex(i)
							}

							onChange({ ...value, [key]: newValue })
						}

					return (
						<InputRange2D
							ref={ref}
							key={interactiveKey}
							xProps={!mapX ? undefined : {
								value: value[mapX],
								label: mapX,
								name: mapX,
								onChange: createOnChange(mapX)
							}}
							yProps={!mapY ? undefined : {
								value: value[mapY],
								label: mapY,
								name: mapY,
								onChange: createOnChange(mapY)
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
					{activePointConfig && (
						<rect
							x={previousPointConfig.point[0]}
							y={
								activePointConfig.mapY
									? 0
									: activePointConfig.point[1] - (style.dotSizeActive / 2)
							}
							width={maxRangeX}
							height={activePointConfig.mapY ? height : style.dotSizeActive}
							className={style.rangeGuideBox(color)}
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
								className={style.circle(color)}
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
