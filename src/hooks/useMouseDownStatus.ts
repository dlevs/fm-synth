import { useState, useCallback } from 'react'

// TODO: DELETE ME in favour of usePointerStatus
const useMouseDownStatus = () => {
	const [isMouseDown, setMouseDown] = useState(false)

	return {
		isMouseDown,
		mouseDownProps: {
			onPointerDown: useCallback(() => setMouseDown(true), []),
			onPointerUp: useCallback(() => setMouseDown(false), [])
		}
	}
}

export default useMouseDownStatus
