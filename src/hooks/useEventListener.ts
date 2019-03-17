import { useAutoEffect } from 'hooks.macro'

const useEventListener = (
	element: EventTarget,
	event: string,
	callback: EventListener,
	options?: boolean | AddEventListenerOptions
): void => {
	useAutoEffect(() => {
		element.addEventListener(event, callback, options)

		return () => {
			element.removeEventListener(event, callback, options)
		}
	})
}

export default useEventListener
