import { useState, useCallback, useRef, HTMLProps } from 'react';
import useEventListener from './useEventListener';
import { getRelativeMouseCoordinates } from '../lib/eventUtils';
import { RelativePoint } from '../lib/types';

type Status = 'inactive' | 'hover' | 'active';

interface PointerStatus {
	status: {
		value: Status;
		last: Status;
		hasChanged: boolean;
	};
	point: RelativePoint | null;
	pointerStatusProps: HTMLProps<HTMLElement>;
}

const usePointerStatus = (): PointerStatus => {
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

	const setPointFromEvent = (event: Event) =>
		setPoint(getRelativeMouseCoordinates(event, wrapper.current));

	const createHandler = (callback: EventListener, inputs = []) =>
		useCallback(event => {
			setPointFromEvent(event);
			callback(event);
		}, inputs);

	const onPointerEnter = createHandler(() => setIsPointerOver(true));
	const onPointerLeave = createHandler(() => setIsPointerOver(false));
	const onPointerDown = useCallback(() => setIsPointerDown(true), []);

	useEventListener(document, 'pointerup', () => setIsPointerDown(false), []);
	useEventListener(document, 'pointermove', event => {
		if (status !== 'inactive') {
			setPointFromEvent(event);
		}
	}, [status]);

	const output = {
		status: {
			value: status,
			last: lastStatus.current,
			hasChanged: status !== lastStatus.current,
		},
		point,
		pointerStatusProps: {
			ref: wrapper,
			onPointerEnter,
			onPointerLeave,
			onPointerDown,
			style: {
				touchAction: 'none',
			},
		},
	};

	lastStatus.current = status;

	return output;
};

export default usePointerStatus;
