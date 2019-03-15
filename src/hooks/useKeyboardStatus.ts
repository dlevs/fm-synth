import { useState } from 'react'
import { useAutoCallback } from 'hooks.macro'
import useEventListener from './useEventListener'

const initialStatus = {
	shiftKey: false,
	ctrlKey: false,
	metaKey: false,
	altKey: false
}

const useKeyboardStatus = (): typeof initialStatus => {
	const [keyStatus, setKeyStatus] = useState(initialStatus)

	const handleKeyEvent = useAutoCallback((event: Event) => {
		// if (!shouldTrack) {
		// return;
		// }

		const { shiftKey, ctrlKey, metaKey, altKey } = event as KeyboardEvent
		setKeyStatus({ shiftKey, ctrlKey, metaKey, altKey })
	})

	useEventListener(document, 'keydown', handleKeyEvent)
	useEventListener(document, 'keyup', handleKeyEvent)

	// TODO: tidy up
	// if (shouldTrack) {
	return keyStatus
	// }

	// return initialStatus;
}

export default useKeyboardStatus
