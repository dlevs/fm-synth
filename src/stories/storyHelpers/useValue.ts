import { useState } from 'react'
import { action } from '@storybook/addon-actions'

// TODO: Can this be a hook?
function useValue<T> (initialValue: T) {
	const [value, setValue] = useState(initialValue)

	return {
		value,
		setValue: (newValue: T) => {
			action('setValue')(newValue)
			setValue(newValue)
		}
	}
}

export default useValue
