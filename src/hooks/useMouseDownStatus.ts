import { useState } from 'react'
import { useAutoCallback } from 'hooks.macro'

// TODO: DELETE ME in favour of usePointerStatus
const useMouseDownStatus = () => {
	const [isMouseDown, setMouseDown] = useState(false)

	return {
		isMouseDown,
		mouseDownProps: {
			onPointerDown: useAutoCallback(() => setMouseDown(true)),
			onPointerUp: useAutoCallback(() => setMouseDown(false))
		}
	}
}

export default useMouseDownStatus
