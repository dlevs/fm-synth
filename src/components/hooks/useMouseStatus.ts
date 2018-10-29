import useMouseDownStatus from './useMouseDownStatus';
import useMouseOverStatus from './useMouseOverStatus';

const useMouseStatus = () => {
	const { isMouseDown, mouseDownProps } = useMouseDownStatus();
	const { isMouseOver, mouseOverProps } = useMouseOverStatus();

	return {
		isMouseDown,
		isMouseOver,
		mouseStatusProps: {
			...mouseDownProps,
			...mouseOverProps,
		},
	};
};

export default useMouseStatus;
