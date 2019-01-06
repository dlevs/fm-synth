import { useState, useEffect, useCallback, useRef, RefObject } from 'react';
import useEventListener from './useEventListener';
import { getRelativePointFromEvent, constrainPoint } from '../lib/pointUtils';

type Status = 'inactive' | 'hover' | 'active';

export const defaultStatus = {
	value: 'inactive' as Status,
	isHovered: false,
	isActive: false,
};

export const defaultPoint = constrainPoint([0, 0], [0, 0]);

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
 * `pointerStatusProps` has the CSS rule `touch-action: none;` in order not to
 * cancel interactions immediately on touch devices due to scrolling.
 */
const usePointerStatus = ({
	onPointChange,
	onStatusChange,
}: {
	onPointChange?(relativePoint: typeof defaultPoint, nextStatus: typeof defaultStatus): void;
	// TODO: Is this silly? Return status always as return value instead?
	onStatusChange?(status: typeof defaultStatus): void;
} = {}) => {
	// Setup variables
	const [isPointerOver, setIsPointerOver] = useState(false);
	const [isPointerDown, setIsPointerDown] = useState(false);
	const status: Status = isPointerDown
		? 'active'
		: isPointerOver
			? 'hover'
			: 'inactive';
	const wrapper = useRef(null as null | HTMLElement);
	const lastStatus = useRef(status);

	// TODO: Tidy. Rename.
	const statusObj: typeof defaultStatus = {
		// Most relevant status as a string
		value: status,

		// Boolean breakdown of individual parts of status, since an element
		// can be both active and hovered at the same time, but you would
		// not be able to tell from the `status` string alone.
		isHovered: isPointerOver,
		isActive: status === 'active',
	};

	// TODO: Can we use `PointerEvent` type for argument annotation?
	// TODO: Can we wrap this in "useCallback and keep the "status" inputs logic here?
	const eventInputs = [status, wrapper.current, onPointChange, onStatusChange];
	const handlePointerEvent = useCallback((event: Event | React.PointerEvent) => {
		let shouldSetPoint = true;

		if (!wrapper.current) {
			return;
		}

		switch (event.type) {
			case 'pointerdown':
				setIsPointerDown(true);
				break;

			case 'pointerup':
				if (status === 'active') {
					setIsPointerDown(false);
				} else {
					shouldSetPoint = false;
				}
				break;

			case 'pointerenter':
				setIsPointerOver(true);
				break;

			case 'pointerleave':
				if (status !== 'active') {
					shouldSetPoint = false;
				}
				setIsPointerOver(false);
				break;

			case 'pointermove':
				if (
					status === 'inactive' ||
					(
						status === 'hover' &&
						wrapper.current !== event.target &&
						!wrapper.current.contains(event.target as Element)
					)
				) {
					shouldSetPoint = false;
				}
				break;
		}

		if (shouldSetPoint && onPointChange) {
			const relativePoint = getRelativePointFromEvent(
				event as PointerEvent,
				wrapper.current,
			);
			onPointChange(relativePoint, statusObj);
		}

	// TODO: Pass `wrapper` or `wrapper.current` here? What's best practice?
	}, eventInputs);

	// Apply event listeners to track events from outside the element
	// TODO: We pass inputs here as well?
	useEventListener(document, 'pointerup', handlePointerEvent, eventInputs);
	useEventListener(document, 'pointermove', handlePointerEvent, eventInputs);
	useEffect(() => {
		if (onStatusChange) {
			onStatusChange(statusObj);
		}
		lastStatus.current = status;
	}, [isPointerOver, isPointerDown]);

	return {
		ref: wrapper as RefObject<any>,
		// TODO: Do we need "useCallback" here, or is it OK to just use raw function when not prop drilling?
		onPointerDown: handlePointerEvent,
		onPointerEnter: handlePointerEvent,
		onPointerLeave: handlePointerEvent,
		'data-status': status,
	};
};

export default usePointerStatus;
