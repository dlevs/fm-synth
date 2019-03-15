import useEventListener from './useEventListener'
import { useState } from 'react'
import { useAutoCallback, useAutoLayoutEffect } from 'hooks.macro'

// TODO: I can't even reason with this file anymore. Is this OK? Take another look
const useMedia = (query: string): boolean => {
	const [matches, setMatches] = useState(false)
	const eventListener = useAutoCallback((event: Event) => {
		setMatches((event as MediaQueryListEvent).matches)
	})
	const media = window.matchMedia(query)

	useAutoLayoutEffect(() => {
		setMatches(media.matches)
	})

	useEventListener(media, 'change', eventListener)

	return matches
}

export default useMedia
