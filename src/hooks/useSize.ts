import { useState, RefObject } from 'react'
import { useAutoCallback, useAutoLayoutEffect } from 'hooks.macro'
import useEventListener from './useEventListener.js'

const useSize = (ref: RefObject<Element | null>) => {
	const getSizeFromRef = useAutoCallback(() => {
		const { clientWidth = 0, clientHeight = 0 } = ref.current || {}

		return {
			width: clientWidth,
			height: clientHeight
		}
	})
	const [size, setSize] = useState(getSizeFromRef)
	const setSizeFromRef = useAutoCallback(() => {
		setSize(getSizeFromRef())
	})

	// Run on mount to trigger a re-render once ref is updated with mounted element.
	useAutoLayoutEffect(() => {
		setSizeFromRef()
	})

	// Attach listener
	useEventListener(window, 'resize', setSizeFromRef)

	return size
}

export default useSize
