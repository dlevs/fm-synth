import React, { KeyboardEvent, FocusEvent, HTMLProps, useState, useRef } from 'react';
import InputRange, { Props as InputRangeProps } from './InputRange';

interface Props extends HTMLProps<HTMLInputElement> {
	xProps?: InputRangeProps;
	yProps?: InputRangeProps;
}

/**
 * Two range inputs that may be interacted with as though they were a single input.
 *
 * When using keyboard controls, the user may pres TAB to move focus to one of the
 * input elements. Pressing TAB again moves focus to the next element outside of
 * this component, and not the next input field.
 *
 * Pressing LEFT or RIGHT will focus the "x" input and change the value.
 * Pressing UP or DOWN will focus the "y" input and change the value.
 */
export const InputRange2D = ({ xProps, yProps, ...sharedProps }: Props) => {
	const xRef = useRef(null as null | HTMLInputElement);
	const yRef = useRef(null as null | HTMLInputElement);
	const [focusedParam, setFocusedParam] = useState(null as null | 'x' | 'y');

	const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		const { key } = event;

		if (
			!(xProps && yProps) ||
			![
				'ArrowLeft',
				'ArrowRight',
				'ArrowUp',
				'ArrowDown',
			].includes(key)
		) {
			return;
		}
		event.preventDefault();

		const param = (key === 'ArrowLeft' || key === 'ArrowRight')
			? 'x'
			: 'y';
		const input = param === 'x'
			? xRef.current
			: yRef.current;
		const relatedProps = param === 'x'
			? xProps
			: yProps;

		if (!input || !relatedProps || !relatedProps.onChange) {
			return;
		}

		const value = Number(input.value);
		const step = Number(input.step || 1);
		const delta = (key === 'ArrowLeft' || key === 'ArrowDown')
			? -step
			: step;

		if (param !== focusedParam) {
			input.focus();
			setFocusedParam(param);
		}

		relatedProps.onChange(value + delta);
	};

	const onBlur = (event: FocusEvent<HTMLInputElement>) => {
		if (![
			xRef.current,
			yRef.current,
		].includes(event.relatedTarget as any)) {
			setFocusedParam(null);
		}
	};

	const sharedPropsInternal = {
		onKeyDown,
		onBlur,
	};

	return (
		<>
			{xProps && (
				<InputRange
					{...sharedProps}
					{...xProps}
					label={
						yProps && yProps.label
							? `${xProps.label} (press left or right for ${yProps.label})`
							: xProps.label
					}
					ref={xRef}
					tabIndex={focusedParam === 'y' ? -1 : 0}
					{...sharedPropsInternal}
				/>
			)}
			{yProps && (
				<InputRange
					{...sharedProps}
					{...yProps}
					label={
						xProps && xProps.label
						? `${yProps.label} (press up or down for ${xProps.label})`
						: yProps.label
					}
					ref={yRef}
					tabIndex={-1}
					{...sharedPropsInternal}
				/>
			)}
		</>
	);
};

export default InputRange2D;
