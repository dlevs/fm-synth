import { useState } from 'react';
import useEventListener from './useEventListener';

const initialStatus = {
	shiftKey: false,
	ctrlKey: false,
	metaKey: false,
	altKey: false,
};

const useKeyboardStatus = () => {
	const [keyStatus, setKeyStatus] = useState(initialStatus);

	const handleKeyEvent = (event: Event) => {
		// if (!shouldTrack) {
		// 	return;
		// }

		const { shiftKey, ctrlKey, metaKey, altKey } = event as KeyboardEvent;
		setKeyStatus({ shiftKey, ctrlKey, metaKey, altKey });
	};

	useEventListener(document, 'keydown', handleKeyEvent, [/* TODO: shouldTrack */]);
	useEventListener(document, 'keyup', handleKeyEvent, [/* TODO: shouldTrack */]);

	// TODO: tify up
	// if (shouldTrack) {
	return keyStatus;
	// }

	// return initialStatus;
};

export default useKeyboardStatus;
