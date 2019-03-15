import { useState, useLayoutEffect, RefObject } from 'react'
import { useAutoCallback } from 'hooks.macro'
import useEventListener from './useEventListener'

interface Size {
	width: number;
	height: number;
}

const getSizeFromRef = (
	ref: RefObject<Element | null>
): Size => {
	const { clientWidth = 0, clientHeight = 0 } = ref.current || {}

	return {
		width: clientWidth,
		height: clientHeight
	}
}

const useSize = (
	ref: RefObject<Element | null>
): Size => {
	const [size, setSize] = useState(getSizeFromRef(ref))
	const setSizeFromRef = useAutoCallback(() => {
		setSize(getSizeFromRef(ref))
	})

	// Run on mount to trigger a re-render once ref is updated with mounted element.
	useLayoutEffect(setSizeFromRef, [])

	// Attach listener
	useEventListener(window, 'resize', setSizeFromRef)

	return size
}

export default useSize
