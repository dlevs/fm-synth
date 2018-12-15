import { useEffect } from 'react';

export const baseUseEventListener = (
	element: EventTarget,
	event: string | string[],
	callback: EventListener,
) => {
	const events = typeof event === 'string' ? [event] : event;

	events.forEach(eventName => {
		element.addEventListener(eventName, callback as EventListener);
	});

	return () => {
		events.forEach(eventName => {
			element.removeEventListener(eventName, callback as EventListener);
		});
	};
};

const useEventListener = (
	element: EventTarget,
	event: string | string[],
	callback: EventListener,
	inputs?: any[],
) => {
	useEffect(() => {
		return baseUseEventListener(element, event, callback);
	}, inputs);
};

export default useEventListener;
