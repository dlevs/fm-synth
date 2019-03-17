import { useAutoEffect } from 'hooks.macro'

const useEventListener = (
	element: EventTarget,
	event: string,
	callback: EventListener,
	options?: boolean | AddEventListenerOptions
): void => {
	useAutoEffect(() => {
		console.log(`Registering event "${event}" on ${element}`)
		element.addEventListener(event, callback, options)

		return () => {
			element.removeEventListener(event, callback, options)
		}
	})
}

export default useEventListener
