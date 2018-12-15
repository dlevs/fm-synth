import { useState, useCallback } from 'react';
import useEventListener from './useEventListener';

const useMouseDownStatus = () => {
	const [isMouseDown, setMouseDown] = useState(false);

	useEventListener(
		document,
		['mouseup', 'touchend'],
		() => setMouseDown(false),
		[],
	);

	return {
		isMouseDown,
		mouseDownProps: {
			onMouseDown: useCallback(() => setMouseDown(true), []),
			onTouchStart: useCallback(() => setMouseDown(true), []),
		},
	};
};

export default useMouseDownStatus;
