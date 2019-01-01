import { useState, useCallback } from 'react';

// TODO: DELETE ME in favour of usePointerStatus
const useMouseOverStatus = () => {
	const [isMouseOver, setMouseOver] = useState(false);

	return {
		isMouseOver,
		mouseOverProps: {
			onMouseEnter: useCallback(() => setMouseOver(true), []),
			onMouseLeave: useCallback(() => setMouseOver(false), []),
		},
	};
};

export default useMouseOverStatus;
