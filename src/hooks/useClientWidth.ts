import { RefObject, useState, useEffect } from 'react';

const useClientWidth = (ref: RefObject<HTMLElement | null>) => {
	const [width, setWidth] = useState(0);

	useEffect(() => {
		const setWidthFromRef = () => {
			if (ref.current) {
				setWidth(ref.current.clientWidth);
			}
		};

		setWidthFromRef();
		window.addEventListener('resize', setWidthFromRef);

		return () => {
			window.removeEventListener('resize', setWidthFromRef);
		};
	}, []);

	return width;
};

export default useClientWidth;
