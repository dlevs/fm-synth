import useMouseDownStatus from './useMouseDownStatus.js'
import useMouseOverStatus from './useMouseOverStatus.js'

// TODO: DELETE ME in favour of usePointerStatus
const useMouseStatus = () => {
	const { isMouseDown, mouseDownProps } = useMouseDownStatus()
	const { isMouseOver, mouseOverProps } = useMouseOverStatus()

	return {
		isMouseDown,
		isMouseOver,
		mouseStatusProps: {
			...mouseDownProps,
			...mouseOverProps
		}
	}
}

export default useMouseStatus
