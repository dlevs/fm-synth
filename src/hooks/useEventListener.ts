import { useEffect } from 'react';

const useEventListener = (
	element: EventTarget,
	event: string | string[],
	callback: EventListener | React.EventHandler<React.MouseEvent>,
	inputs?: any[],
) => {
	const events = typeof event === 'string' ? [event] : event;

	useEffect(() => {
		events.forEach(eventName => {
			element.addEventListener(eventName, callback as EventListener);
		});

		return () => {
			events.forEach(eventName => {
				element.removeEventListener(eventName, callback as EventListener);
			});
		};
	}, inputs);
};

export default useEventListener;
