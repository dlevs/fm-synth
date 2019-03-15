import { HTMLProps, forwardRef, Ref, Fragment } from 'react'
import useUniqueId from '../hooks/useUniqueId'
import { provideEventTargetValue } from '../lib/eventUtils'

export interface Props extends HTMLProps<HTMLInputElement> {
	label: string;
	setValue?: (value: number) => void;
	ref?: Ref<HTMLInputElement>;
}

/**
 * A simple range input.
 */
export const InputRange = (
	{ label, setValue, ...otherProps }: Props,
	ref: Ref<HTMLInputElement>
) => {
	const id = useUniqueId()

	return (
		<Fragment>
			<label htmlFor={id}>{label}</label>
			<input
				id={id}
				ref={ref}
				type='range'
				onChange={provideEventTargetValue(Number, setValue)}
				{...otherProps}
			/>
		</Fragment>
	)
}

export default forwardRef(InputRange)
