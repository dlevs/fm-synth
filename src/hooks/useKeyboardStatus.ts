import { useState } from 'react';
import useEventListener from './useEventListener';

const initialStatus = {
	shiftKey: false,
	ctrlKey: false,
	metaKey: false,
	altKey: false,
};

const useKeyboardStatus = (shouldTrack = true) => {
	const [keyStatus, setKeyStatus] = useState(initialStatus);

	const handleKeyEvent = (event: Event) => {
		if (!shouldTrack) {
			return;
		}

		const { shiftKey, ctrlKey, metaKey, altKey } = event as KeyboardEvent;
		setKeyStatus({ shiftKey, ctrlKey, metaKey, altKey });
	};

	useEventListener(document, 'keydown', handleKeyEvent, [shouldTrack]);
	useEventListener(document, 'keyup', handleKeyEvent, [shouldTrack]);

	if (shouldTrack) {
		return keyStatus;
	}

	return initialStatus;
};

export default useKeyboardStatus;
