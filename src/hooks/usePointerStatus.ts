import { useState, useCallback, useRef, RefObject } from 'react';
import useEventListener from './useEventListener';
import useCallbacks from './useCallbacks';
import { getRelativePointFromEvent } from '../lib/pointUtils';
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
	const wrapper = useRef(null as null | HTMLElement);
	const lastStatus = useRef('inactive' as Status);
	const status: Status = isPointerDown
		? 'active'
		: isPointerOver
			? 'hover'
			: 'inactive';

	// Helpers for event management
	const setPointFromEvent = (event: PointerEvent) => {
		if (wrapper.current) {
			setPoint(getRelativePointFromEvent(event, wrapper.current));
		}
	};

	// TODO: Can we use `PointerEvent` type for argument annotation?
	// TODO: Can we wrap this in "useCallback and keep the "status" inputs logic here?
	const setPointFromEventConditionally = (event: Event) => {
		switch (status) {
			case 'active':
				setPointFromEvent(event as PointerEvent);
				break;

			case 'hover':
				if (!wrapper.current) {
					return;
				}

				// TODO: Test for a nested element too
				if (wrapper.current === event.target/*wrapper.current.contains(event.target as Node)*/) {
					setPointFromEvent(event as PointerEvent);
				}
				break;
		}
	};

	// Apply event listeners to track events from outside the element
	useEventListener(document, 'pointerup', () => setIsPointerDown(false), []);
	useEventListener(document, 'pointermove', setPointFromEventConditionally, [status]);

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
			ref: wrapper as RefObject<any>,
			// TODO: Do we need "useCallbacks" here, or is it OK to just use raw function when not prop drilling?
			onPointerDown: useCallbacks([setPointFromEvent, () => setIsPointerDown(true)], []),
			onPointerEnter: useCallbacks([setPointFromEvent, () => setIsPointerOver(true)], []),
			// TODO: This complexity of sometimes setting point onPointerLeave worth it? Will status not be "hover" anyway if setState is asynchronous?
			onPointerLeave: useCallbacks([() => setIsPointerOver(false), setPointFromEventConditionally], [status]),
			style: {
				touchAction: 'none',
			},
		},
	};

	lastStatus.current = status;

	return output;
};

export default usePointerStatus;
