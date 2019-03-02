import React, { useState, useRef, useEffect } from 'react'
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

}

// TODO: Typing directly on the fn works in "withOwnState.tsx". Why not here?

export const InputRangeLine = (props: Props) => {
	// Props
	const {
		value,
		// setValue,
		// pointsConfig,
		// divideWidth,
		max = MIDI_MAX,
		color = '#444'
	} = props
	const width = 100
	const height = 6
	const yCenter = height / 2

	return <>
		{/* <div className={styleVisuallyHidden}> */}
			<InputRange {...props} max={max} />
		{/* </div> */}
		<svg
			className={style.svg}
			width='100%'
			height='300'
			viewBox={`0 0 ${width} ${height}`}
			preserveAspectRatio='none'
		>
			<SVGPolyline
				className={style.svgBase(color)}
				pointsArray={[
					[0, yCenter],
					[width, yCenter]
				]}
			/>
			<SVGLineCircle
				className={style.circle(color)}
				point={[
					(Number(value) / Number(max)) * width,
					yCenter
				]}
			/>
		</svg>
	</>
}

export default InputRangeLine
