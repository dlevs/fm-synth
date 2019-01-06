import React from 'react';
import { css } from 'emotion';
import { storiesOf } from '@storybook/react';
import usePointerStatus from '../hooks/usePointerStatus';

const styleDemoBorder = css`
	margin: 0;
	padding: 2rem;
	border: 1px solid #444;
`;

const styleDemoWrapper = css`
	${styleDemoBorder}
	position: relative;
	max-width: 30rem;
	margin: 2rem auto;
	cursor: grab;
	white-space: pre-wrap;
	user-select: none;

	/* "touch-action: none;" needed to make use of pointermove on mobile */
	touch-action: none;

	/* Data attributes applied by usePointerStatus */
	&[data-status="hover"] {
		background: lightblue;
	}

	&[data-status="active"] {
		background: lightgreen;
		cursor: grabbing;
	}
`;

const styleDemoInnerEl = css`
	${styleDemoBorder}
	margin-top: 2rem;
	background: rgba(0, 0, 0, 0.05);

	&:hover {
		background: rgba(0, 0, 0, 0.1);
	}
`;

const styleDot = css`
	position: absolute;
	pointer-events: none;
	background: rgba(0, 0, 0, 0.4);
	border-radius: 100%;
	width: 3rem;
	height: 3rem;
	transform: translate(-50%, -50%);
`;

const styleDotUnconstrained = css`
	${styleDot}
	background: rgba(0, 0, 255, 0.4);
`;

const PointerStatusDemo = () => {
	// TODO: Rename these for more context when destructuring?
	const { props, ...pointerStatus } = usePointerStatus();
	const [left, top] = pointerStatus.point.constrained;
	const [leftUnconstrianed, topUnconstrained] = pointerStatus.point.unconstrained;
	return (
		<pre {...props} className={styleDemoWrapper}>
			{JSON.stringify(pointerStatus, null, 4)}
			<p className={styleDemoInnerEl}>
				Nested element to test.<br />
				Make sure the point values still change when hovering over here.
			</p>
			<div className={styleDot} style={{ left, top }} />
			<div className={styleDotUnconstrained} style={{ left: leftUnconstrianed, top: topUnconstrained }} />
		</pre>
	);
};

storiesOf('usePointerStatus', module)
	.add('Basic usage', () => (
		<PointerStatusDemo />
	));
