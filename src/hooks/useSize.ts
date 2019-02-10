import { useState, useLayoutEffect, RefObject } from 'react'
import useEventListener from './useEventListener'

const getSizeFromRef = (ref: RefObject<Element | null>) => {
	const { clientWidth = 0, clientHeight = 0 } = ref.current || {}

	return {
		width: clientWidth,
		height: clientHeight
	}
}

const useSize = (ref: RefObject<Element | null>) => {
	const [size, setSize] = useState(getSizeFromRef(ref))
	const setSizeFromRef = () => {
		setSize(getSizeFromRef(ref))
	}

	// Run on mount to trigger a re-render once ref is updated with mounted element.
	useLayoutEffect(setSizeFromRef, [ref])

	// Attach listener
	useEventListener(window, 'resize', setSizeFromRef, [ref])

	return size
}

export default useSize
