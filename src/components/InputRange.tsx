import React, { HTMLProps, forwardRef, Ref } from 'react'
import useUniqueId from '../hooks/useUniqueId'
import { createOnChangeHandler } from '../lib/eventUtils'
import { ChangeHandler, Omit } from '../lib/types'

export interface Props extends Omit<HTMLProps<HTMLInputElement>, 'onChange'> {
	label: string
	onChange?: ChangeHandler<number>
	ref?: Ref<HTMLInputElement>
}

/**
 * A simple range input.
 */
export const InputRange = ((
	{ label, onChange, ...otherProps }: Props,
	ref: Ref<HTMLInputElement>
) => {
	const id = useUniqueId()

	return <>
		<label htmlFor={id}>{label}</label>
		<input
			id={id}
			ref={ref}
			type='range'
			onChange={createOnChangeHandler(onChange, Number)}
			{...otherProps}
		/>
	</>
})

export default forwardRef(InputRange)
