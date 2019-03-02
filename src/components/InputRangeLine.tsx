import React, { useState, useRef, useEffect } from 'react'
import { cx, css } from 'emotion'
import clamp from 'lodash/fp/clamp'
import { MIDI_MIN, MIDI_MAX, scaleMIDIValueBetween } from '../lib/scales'
import { getClosestPointIndex, expandPointConfigs, cumulativeX } from '../lib/pointUtils'
import { Point, PointConfig } from '../lib/types'
import { styleVisuallyHidden } from '../lib/utilityStyles'
import InputRange2D from './InputRange2D'
import SVGLineCircle from './SVGLineCircle'
import SVGPolyline from './SVGPolyline'
import usePointerStatus, { defaultPoint } from '../hooks/usePointerStatus'
import useKeyboardStatus from '../hooks/useKeyboardStatus'
import useSize from '../hooks/useSize'

import * as style from './InputEnvelope.style'
import { InputEnvelopeType } from './InputEnvelope.types'
import InputRange, { Props as InputRangeProps } from './InputRange'

// TODO: Share these props from InputEnvelope:

interface Props extends InputRangeProps {
	orient?: 'horizontal' | 'vertical'
}

const styleRotate = css({
	transform: 'rotate(180deg)'
})

// TODO: Typing directly on the fn works in "withOwnState.tsx". Why not here?

export const InputRangeLine = (props: Props) => {
	// Props
	const {
		value,
		orient = 'horizontal',
		// setValue,
		// pointsConfig,
		// divideWidth,
		max = MIDI_MAX,
		color = '#444'
	} = props
	const width = 100
	const height = 6
	const yCenter = height / 2
	const isVertical = orient === 'vertical'
	const flipPoint = ([x, y]: Point): Point =>
		isVertical ? [y, x] : [x, y]

	return <>
		{/* <div className={styleVisuallyHidden}> */}
			<InputRange {...props} max={max} />
		{/* </div> */}
		<svg
			className={cx(style.svg, {
				[styleRotate]: isVertical
			})}
			width='100%'
			height='300'
			viewBox={`0 0 ${flipPoint([width, height]).join(' ')}`}
			preserveAspectRatio='none'
		>
			<SVGPolyline
				className={style.svgBase(color)}
				pointsArray={[
					flipPoint([0, yCenter]),
					flipPoint([width, yCenter])
				]}
			/>
			<SVGLineCircle
				className={style.circle(color)}
				point={flipPoint([
					(Number(value) / Number(max)) * width,
					yCenter
				])}
			/>
		</svg>
	</>
}

export default InputRangeLine
