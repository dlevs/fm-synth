import clamp from 'lodash/clamp';
import { RelativePoint } from './types';

// TODO: Rename to include "Point"
export const getRelativeMouseCoordinates = (
	event: Event, // TODO: Be more specific with event type here?
	element?: Element,
): RelativePoint => {
	const bounds = (element || event.target as Element).getBoundingClientRect();
	let coordinates;

	// TODO: Test this with multiple touches. May want to ignore touchend/ touchdown for 2nd/ 3rd touches....
	switch (event.type) {
		case 'touchstart':
			coordinates = (event as TouchEvent).touches[0];
			break;

		case 'touchmove':
		case 'touchend':
			coordinates = (event as TouchEvent).changedTouches[0];
			break;

		default:
			coordinates = event as MouseEvent;
	}

	const x = coordinates.clientX - bounds.left;
	const y = coordinates.clientY - bounds.top;

	return {
		unconstrained: [x, y],
		constrained: [
			clamp(x, 0, bounds.width),
			clamp(y, 0, bounds.height),
		],
	};
};
