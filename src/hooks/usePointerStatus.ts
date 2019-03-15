import { useRef, RefObject } from 'react'
import { useAutoCallback } from 'hooks.macro'
import useEventListener from './useEventListener'
import { getRelativePointFromEvent, constrainPoint } from '../lib/pointUtils'

type Status = 'inactive' | 'hover' | 'active'

export const defaultStatus = {
	value: 'inactive' as Status,
	isHovered: false,
	isActive: false
}

export const defaultPoint = constrainPoint([0, 0], [0, 0])

const getStatus = (
	isPointerOver: boolean,
	isPointerDown: boolean
): Status =>
	isPointerDown
		? 'active'
		: isPointerOver
			? 'hover'
			: 'inactive'

const getExpandedStatus = (
	isPointerOver: boolean,
	isPointerDown: boolean
): typeof defaultStatus => {
	const status = getStatus(isPointerOver, isPointerDown)
	return {
		// Most relevant status as a string
		value: status,

		// Boolean breakdown of individual parts of status, since an element
		// can be both active and hovered at the same time, but you would
		// not be able to tell from the `status` string alone.
		isHovered: isPointerOver,
		isActive: status === 'active'
	}
}

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
	onChange
}: {
	wrapperRef: RefObject<Element>
	relativeToRef?: RefObject<Element>
	onChange (params: {
		point: typeof defaultPoint
		status: Status
		previousStatus: Status
		event: Event | React.PointerEvent
	}): void;
}) => {
	// Setup variables
	const isPointerOver = useRef(false)
	const isPointerDown = useRef(false)
	const previousStatus = useRef('inactive' as Status)
	const point = useRef(defaultPoint)

	// TODO: Can we use `PointerEvent` type for argument annotation?
	const handlePointerEvent = useAutoCallback((event: Event | React.PointerEvent) => {
		if (!wrapperRef.current) return

		const eventPoint = getRelativePointFromEvent(
			event as PointerEvent,
			relativeToRef && relativeToRef.current
				? relativeToRef.current
				: wrapperRef.current
		)

		switch (event.type) {
			case 'pointerdown':
				isPointerDown.current = true
				point.current = eventPoint
				break

			case 'pointerup':
				if (previousStatus.current === 'active') {
					isPointerDown.current = false
					point.current = eventPoint
				}
				break

			case 'pointerenter':
				isPointerOver.current = true
				point.current = eventPoint
				break

			case 'pointerleave':
				if (previousStatus.current === 'active') {
					point.current = eventPoint
				}
				isPointerOver.current = false
				break

			case 'pointermove':
				if (
					previousStatus.current !== 'inactive' &&
					!(
						previousStatus.current === 'hover' &&
						wrapperRef.current !== event.target &&
						!wrapperRef.current.contains(event.target as Element)
					)
				) {
					point.current = eventPoint
				}
				break
		}

		const status = getExpandedStatus(isPointerOver.current, isPointerDown.current)

		onChange({
			point: point.current,
			status: status.value,
			previousStatus: previousStatus.current,
			event
		})

		previousStatus.current = status.value
	})

	// Apply event listeners to track events from outside the element
	useEventListener(document, 'pointerup', handlePointerEvent)
	useEventListener(document, 'pointermove', handlePointerEvent)

	return {
		// TODO: Do we need "useCallback" here, or is it OK to just use raw function when not prop drilling?
		onPointerDown: handlePointerEvent,
		onPointerEnter: handlePointerEvent,
		onPointerLeave: handlePointerEvent
	}
}

export default usePointerStatus
