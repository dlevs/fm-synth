import { useState } from 'react';
import useEventListener from './useEventListener';

const useMouseDownStatus = () => {
	const [isMouseDown, setMouseDown] = useState(false);
	const mouseDownProps = {
		onMouseDown: () => setMouseDown(true),
		// TODO: TouchStart necessary?
		onTouchStart: () => setMouseDown(true),
	};
	const setMouseDownFalse = () => setMouseDown(false);

	useEventListener(document, ['mouseup', 'touchend'], setMouseDownFalse, []);

	return {
		isMouseDown,
		mouseDownProps,
	};
};

export default useMouseDownStatus;
