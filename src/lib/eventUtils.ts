import { ChangeEvent } from 'react'
import { ChangeHandler } from './types'

// TODO: ChangeHandler type to live here?

export function createOnChangeHandler<T extends Function> (
	onChange: ChangeHandler,
	castValue?: T
) {
	return (event: ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target as HTMLInputElement

		if (castValue) {
			onChange(castValue(value))
		} else {
			onChange(value)
		}
	}
}
