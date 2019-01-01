import { useState, useCallback, useRef } from 'react';
import useEventListener from './useEventListener';
import { getRelativeMouseCoordinates } from '../lib/eventUtils';
import { RelativePoint } from '../lib/types';

type Status = 'inactive' | 'hover' | 'active';

/**
 * Get the current status of pointer devices in relation to an element. Returns
 * relative coordinates of the cursor and the current status.
 *
 * The approach has been tested and works for mouse, touch and pen.
 *
 * The `status` string value will be `"active"` when dragging on the element,
 * even when the cursor is then moved outside the bounds of the element. It will
 * continue to be `"active"` until a `"pointerup"` event.
 *
 * Ensure the element that has the event listeners applied via
 * `pointerStatusProps` has the CSS rule `touch-action: none` in order not to
 * cancel interactions immediately on touch devices due to scrolling.
 */
const usePointerStatus = () => {
	// Setup variables
	const [isPointerOver, setIsPointerOver] = useState(false);
	const [isPointerDown, setIsPointerDown] = useState(false);
	const [point, setPoint] = useState(null as null | RelativePoint);
	const wrapper = useRef(null as any);
	const lastStatus = useRef('inactive' as Status);
	const status: Status = isPointerDown
		? 'active'
		: isPointerOver
			? 'hover'
			: 'inactive';

	// Helpers for event management
	const setPointFromEvent = (event: Event) =>
		setPoint(getRelativeMouseCoordinates(event, wrapper.current));

	const createHandler = (callback: EventListener, inputs = []) =>
		useCallback(event => {
			setPointFromEvent(event);
			callback(event);
		}, inputs);

	// Apply event listeners to track events from outside the element
	useEventListener(document, 'pointerup', () => setIsPointerDown(false), []);
	useEventListener(document, 'pointermove', event => {
		if (status !== 'inactive') {
			setPointFromEvent(event);
		}
	}, [status]);

	// Construct return value
	const output = {
		status: {
			// Most relevant status as a string
			value: status,
			last: lastStatus.current,

			// `hasChanged` status so changes can be responded to
			hasChanged: status !== lastStatus.current,

			// Boolean breakdown of individual parts of status, since an element
			// can be both active and hovered at the same time, but you would
			// not be able to tell from the `status` string alone.
			isHovered: isPointerOver,
			isActive: status === 'active',
		},
		point,
		pointerStatusProps: {
			ref: wrapper,
			onPointerEnter: createHandler(() => setIsPointerOver(true)),
			onPointerLeave: createHandler(() => setIsPointerOver(false)),
			onPointerDown: createHandler(() => setIsPointerDown(true)),
			style: {
				touchAction: 'none',
			},
		},
	};

	lastStatus.current = status;

	return output;
};

export default usePointerStatus;
