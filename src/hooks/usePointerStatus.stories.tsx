import { css } from '@emotion/core'
import { useState, useRef } from 'react'
import { useAutoCallback } from 'hooks.macro'
import { storiesOf } from '@storybook/react'
import { enableHooks } from '../lib/storybookUtils'
import usePointerStatus, { defaultStatus, defaultPoint } from '../hooks/usePointerStatus'

const styleDemoBorder = css({
	margin: 0,
	padding: '2rem',
	border: '1px solid #444'
})

const styleDemoWrapper = css([
	styleDemoBorder,
	{
		position: 'relative',
		maxWidth: '30rem',
		margin: '2rem auto',
		cursor: 'grab',
		whiteSpace: 'pre-wrap',
		userSelect: 'none'
		/* Data attributes applied by usePointerStatus */
	}
])

// TODO: Remove me
// &[data-status="hover"] {
// 	background: lightblue;
// }

// &[data-status="active"] {
// 	background: lightgreen;
// 	cursor: grabbing;
// }

const styleDemoInnerEl = css([
	styleDemoBorder,
	{
		marginTop: '2rem',
		background: 'rgba(0, 0, 0, 0.05)',

		':hover': {
			background: 'rgba(0, 0, 0, 0.1)'
		}
	}
])

const styleDot = css({
	position: 'absolute',
	pointerEvents: 'none',
	background: 'rgba(0, 0, 0, 0.4)',
	borderRadius: '100%',
	width: '3rem',
	height: '3rem',
	transform: 'translate(-50%, -50%)'
})

const styleDotUnconstrained = css([
	styleDot,
	{
		background: 'rgba(0, 0, 255, 0.4)'
	}
])

storiesOf('usePointerStatus', module)
	.add('Basic usage', enableHooks(() => {
		const [point, setPoint] = useState(defaultPoint)
		const [status, setStatus] = useState(defaultStatus.value)
		const wrapperRef = useRef(null as null | HTMLPreElement)
		const pointerStatusProps = usePointerStatus({
			wrapperRef,
			onChange: useAutoCallback(data => {
				setPoint(data.point)
				setStatus(data.status)
			})
		})
		const [left, top] = point.constrained
		const [leftUnconstrianed, topUnconstrained] = point.unconstrained
		return (
			<pre
				{...pointerStatusProps}
				css={styleDemoWrapper}
				ref={wrapperRef}
			>
				{JSON.stringify({
					status,
					point
				}, null, 4)}
				<p css={styleDemoInnerEl}>
					Nested element to test.<br />
					Make sure the point values still change when hovering over here.
				</p>
				<div css={styleDot} style={{ left, top }} />
				<div css={styleDotUnconstrained} style={{ left: leftUnconstrianed, top: topUnconstrained }} />
			</pre>
		)
	}))
