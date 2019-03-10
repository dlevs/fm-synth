import { ComponentType, useState } from 'react'
import { action } from '@storybook/addon-actions'

/**
 * Provide props to spread into a component for managing its current value,
 * and logging value changes.
 */
export function useValue <T> (initialValue: T) {
	const [value, setValue] = useState(initialValue)

	return {
		value,
		setValue: (newValue: T) => {
			action('setValue')(newValue)
			setValue(newValue)
		}
	}
}

/**
 * Wrap a function that returns a JSX element so that React hook execution
 * does not cause this exception to be thrown:
 *
 * Hooks can only be called inside the body of a function component.
 * (https://fb.me/react-invalid-hook-call)
 *
 * Useful for defining storybook stroies inline.
 */
export const enableHooks = (Fn: ComponentType) => () => <Fn />
