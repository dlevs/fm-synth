export const getRelativeMouseCoordinates = (
	event: Event,
	element?: Element,
) => {
	const bounds = (element || event.target as Element).getBoundingClientRect();
	const { clientX, clientY } = (window.TouchEvent && event instanceof TouchEvent)
		? event.touches[0]
		: event as MouseEvent;

	return {
		x: clientX - bounds.left,
		y: clientY - bounds.top,
	};
};
