import { useAutoEffect } from 'hooks.macro'

const useEventListener = (
	element: EventTarget,
	event: string | string[],
	callback: EventListener
): void => {
	useAutoEffect(() => {
		console.log('USE EVENT LISTENER!!!')
		const events = typeof event === 'string' ? [event] : event

		events.forEach(eventName => {
			element.addEventListener(eventName, callback)
		})

		return () => {
			events.forEach(eventName => {
				element.removeEventListener(eventName, callback)
			})
		}
	})
}

export default useEventListener
