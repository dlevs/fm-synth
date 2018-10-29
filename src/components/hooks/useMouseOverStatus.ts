import { useState } from 'react';

const useMouseOverStatus = () => {
	const [isMouseOver, setMouseOver] = useState(false);

	const mouseOverProps = {
		onMouseEnter: () => setMouseOver(true),
		onMouseLeave: () => setMouseOver(false),
	};

	return {
		isMouseOver,
		mouseOverProps,
	};
};

export default useMouseOverStatus;
