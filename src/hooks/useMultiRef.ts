import { MutableRefObject, useRef, useMemo } from 'react'

/**
 * Get an object which dynamically creates a RefObject for any property queried.
 *
 * This is useful for creating many component refs in a loop, where hooks, like
 * `useRef`, are not allowed due to potential inconsistent call order.
 *
 * @example
 * const refs = useMultiRef()
 * const rawPeople = [{ name: 'Bob' }, { name: 'Jane' }]
 * const people = rawPeople.map(({ name }, i) => ({ name, ref: refs[i] }))
 *
 * // The above works, while this would throw a lint warning:
 * const people = rawPeople.map(({ name }, i) => ({ name, ref: useRef() }))
 * // And if the length of `rawPeople` ever varied, it would throw a runtime error.
 */
const useMultiRef = <T> () => {
	const initialValue: {
		[key: string]: MutableRefObject<T | null>;
		[key: number]: MutableRefObject<T | null>;
	} = {}
	const refs = useRef(initialValue)

	return useMemo(() => new Proxy(refs.current, {
		get: (obj, prop) => {
			// TODO: Remove `tsSafeProp` when TypeScript resolves symbol property
			// keys, and change type of initialValue to `{ [key: PropertyKey]: T }`
			// https://github.com/Microsoft/TypeScript/issues/1863
			const tsSafeProp = prop as string
			obj[tsSafeProp] = obj[tsSafeProp] || { current: null }

			return obj[tsSafeProp]
		}
	}), [])
}

export default useMultiRef
