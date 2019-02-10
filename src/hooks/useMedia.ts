import { baseUseEventListener } from './useEventListener'
import { useState, useLayoutEffect } from 'react'

const useMedia = (query: string) => {
	const [matches, setMatches] = useState(false)

	useLayoutEffect(() => {
		const media = window.matchMedia(query)
		setMatches(media.matches)

		return baseUseEventListener(media, 'change', (event: Event) => {
			setMatches((event as MediaQueryListEvent).matches)
		})
	}, [query])

	return matches
}

export default useMedia
