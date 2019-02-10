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

const getStatus = (
	isPointerOver: boolean,
	isPointerDown: boolean,
): Status =>
	isPointerDown
		? 'active'
		: isPointerOver
			? 'hover'
			: 'inactive';

const getExpandedStatus = (
	isPointerOver: boolean,
	isPointerDown: boolean,
): typeof defaultStatus => {
	const status = getStatus(isPointerOver, isPointerDown);
	return {
		// Most relevant status as a string
		value: status,

		// Boolean breakdown of individual parts of status, since an element
		// can be both active and hovered at the same time, but you would
		// not be able to tell from the `status` string alone.
		isHovered: isPointerOver,
		isActive: status === 'active',
	};
};

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
	wrapperRef,
	relativeToRef,
	onChangeRaw,
	onChange,
}: {
	wrapperRef: RefObject<Element>;
	relativeToRef?: RefObject<Element>;
	onChangeRaw?(event: PointerEvent): void;
	onChange?(params: {
		point: typeof defaultPoint;
		status: Status;
		previousStatus: Status;
	}): void;
}) => {
	// Setup variables
	const isPointerOver = useRef(false);
	const isPointerDown = useRef(false);
	const previousStatus = useRef('inactive' as Status);
	const point = useRef(defaultPoint);

	// TODO: Can we use `PointerEvent` type for argument annotation?
	// TODO: Can we wrap this in "useCallback and keep the "status" inputs logic here?
	const eventInputs = [status, wrapperRef, relativeToRef, onChange];
	const handlePointerEvent = useCallback((event: Event | React.PointerEvent) => {
		let shouldSetPoint = true;

		if (onChangeRaw) {
			onChangeRaw(event);
		}

		if (!wrapperRef.current) {
			return;
		}

		switch (event.type) {
			case 'pointerdown':
				isPointerDown.current = true;
				break;

			case 'pointerup':
				if (previousStatus.current === 'active') {
					isPointerDown.current = false;
				} else {
					shouldSetPoint = false;
				}
				break;

			case 'pointerenter':
				isPointerOver.current = true;
				break;

			case 'pointerleave':
				if (previousStatus.current !== 'active') {
					shouldSetPoint = false;
				}
				isPointerOver.current = false;
				break;

			case 'pointermove':
				if (
					previousStatus.current === 'inactive' ||
					(
						previousStatus.current === 'hover' &&
						wrapperRef.current !== event.target &&
						!wrapperRef.current.contains(event.target as Element)
					)
				) {
					shouldSetPoint = false;
				}
				break;
		}

		const status = getExpandedStatus(isPointerOver.current, isPointerDown.current);

		if (shouldSetPoint) {
			point.current = getRelativePointFromEvent(
				event as PointerEvent,
				relativeToRef
					? relativeToRef.current
					: wrapperRef.current,
			);
		}

		if (onChange) {
			onChange({
				point: point.current,
				status: status.value,
				previousStatus: previousStatus.current,
			});
		}

		previousStatus.current = status.value;
	// TODO: Pass `wrapper` or `wrapperRef.current` here? What's best practice?
	}, eventInputs);

	// Apply event listeners to track events from outside the element
	// TODO: We pass inputs here as well?
	useEventListener(document, 'pointerup', handlePointerEvent, eventInputs);
	useEventListener(document, 'pointermove', handlePointerEvent, eventInputs);

	return {
		// TODO: Do we need "useCallback" here, or is it OK to just use raw function when not prop drilling?
		onPointerDown: handlePointerEvent,
		onPointerEnter: handlePointerEvent,
		onPointerLeave: handlePointerEvent,
	};
};

export default usePointerStatus;
