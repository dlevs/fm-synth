import { useState, useCallback } from 'react';

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
