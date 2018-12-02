import { RefObject, useState, useEffect } from 'react';
import useEventListener from './useEventListener';

const useClientWidth = (ref: RefObject<HTMLElement | null>) => {
	const [width, setWidth] = useState(0);
	const setWidthFromRef = () => {
		if (ref.current) {
			setWidth(ref.current.clientWidth);
		}
	};

	useEffect(setWidthFromRef, []);
	useEventListener(window, 'resize', setWidthFromRef, []);

	return width;
};

export default useClientWidth;
