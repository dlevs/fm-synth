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
	max-width: 30rem;
	margin: 2rem auto;
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

const PointerStatusDemo = () => {
	// TODO: Rename these for more context when destructuring?
	const { pointerStatusProps, ...pointerStatus } = usePointerStatus();
	return (
		<pre {...pointerStatusProps} className={styleDemoWrapper}>
			{JSON.stringify(pointerStatus, null, 4)}
			<p className={styleDemoInnerEl}>
				Nested element to test.<br />
				Make sure the point values still change when hovering over here.
			</p>
		</pre>
	);
};

storiesOf('usePointerStatus', module)
	.add('Basic usage', () => (
		<PointerStatusDemo />
	));
