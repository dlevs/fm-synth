import { useState } from 'react'
import { useAutoCallback } from 'hooks.macro'

// TODO: DELETE ME in favour of usePointerStatus
const useMouseOverStatus = () => {
	const [isMouseOver, setMouseOver] = useState(false)

	return {
		isMouseOver,
		mouseOverProps: {
			onMouseEnter: useAutoCallback(() => setMouseOver(true)),
			onMouseLeave: useAutoCallback(() => setMouseOver(false))
		}
	}
}

export default useMouseOverStatus
