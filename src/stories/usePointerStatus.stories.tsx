import React from 'react';
import { css } from 'emotion';
import { storiesOf } from '@storybook/react';
import usePointerStatus from '../hooks/usePointerStatus';

const statusColorMap = {
	hover: 'lightblue',
	active: 'lightgreen',
};

const styleDemoBorder = css`
	padding: 30px;
	border: 1px solid #444;
`;

const PointerStatusDemo = () => {
	// TODO: Rename these for more context when destructuring?
	const { pointerStatusProps, ...pointerStatus } = usePointerStatus();
	return (
		<pre
			className={css`
				${styleDemoBorder}
				margin: 50px;
				font-size: 20px;
				background: ${statusColorMap[pointerStatus.status.value]};
				user-select: none;

				/* "touch-action: none;" needed to make use of pointermove on mobile */
				touch-action: none;
			`}
			{...pointerStatusProps}
		>
			{JSON.stringify(pointerStatus, null, 4)}
			<p className={css`
				${styleDemoBorder}
				background: rgba(0, 0, 0, 0.05);

				:hover {
					background: rgba(0, 0, 0, 0.1);
				}
			`}>
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
