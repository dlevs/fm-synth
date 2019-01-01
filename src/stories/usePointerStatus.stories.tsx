import React from 'react';
import { storiesOf } from '@storybook/react';
import usePointerStatus from '../hooks/usePointerStatus';

const PointerStatusDemo = () => {
	// TODO: Rename these for more context when destructuring?
	const { pointerStatusProps, ...pointerStatus } = usePointerStatus();
	const statusColorMap = {
		hover: 'lightblue',
		active: 'lightgreen',
	};

	return (
		<pre
			{...pointerStatusProps}
			style={{
				...pointerStatusProps.style,
				margin: 50,
				padding: 30,
				border: '1px solid #444',
				fontSize: 20,
				background: statusColorMap[pointerStatus.status.value],
				userSelect: 'none',
			}}
		>
			{JSON.stringify(pointerStatus, null, 4)}
		</pre>
	);
};

storiesOf('usePointerStatus', module)
	.add('Basic usage', () => (
		<PointerStatusDemo />
	));
