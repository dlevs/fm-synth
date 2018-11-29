import { useState, useEffect } from 'react';
import { EventManager } from '../lib/eventUtils';

const useMouseDownStatus = () => {
	const [isMouseDown, setMouseDown] = useState(false);

	const mouseDownProps = {
		onMouseDown: () => setMouseDown(true),
		// TODO: TouchStart necessary?
		onTouchStart: () => setMouseDown(true),
	};

	useEffect(() => {
		const setMouseDownFalse = () => setMouseDown(false);
		const events = new EventManager(() => [
			[document, 'mouseup', setMouseDownFalse],
			[document, 'touchend', setMouseDownFalse],
		]);
		events.listen();

		return () => events.stopListening();
	}, []);

	return {
		isMouseDown,
		mouseDownProps,
	};
};

export default useMouseDownStatus;
