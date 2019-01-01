import { useState, useCallback } from 'react';
import useEventListener from './useEventListener';

// TODO: DELETE ME in favour of usePointerStatus
const useMouseDownStatus = () => {
	const [isMouseDown, setMouseDown] = useState(false);

	// useEventListener(document, 'pointerup', () => setMouseDown(false), []);

	return {
		isMouseDown,
		mouseDownProps: {
			onPointerDown: useCallback(() => setMouseDown(true), []),
			onPointerUp: useCallback(() => setMouseDown(false), []),
			// onTouchStart: useCallback(() => setMouseDown(true), []),
		},
	};
};

export default useMouseDownStatus;
