import { ChangeEvent } from 'react'

export function provideEventTargetValue<T> (
	castValue: (stringValue: string) => T,
	setValue?: (value: T) => void
) {
	return (event: ChangeEvent<HTMLInputElement>) => {
		if (!setValue) return

		const { value } = event.target as (HTMLInputElement | HTMLTextAreaElement)

		setValue(castValue(value))
	}
}
