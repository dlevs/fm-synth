import React, { KeyboardEvent, FocusEvent, useState, useRef } from 'react';
import InputRange, { Props as InputRangeProps } from './InputRange';

interface Props {
	xProps?: InputRangeProps;
	yProps?: InputRangeProps;
}

export const InputRange2D = ({ xProps, yProps }: Props) => {
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

	return (
		<>
			{xProps && (
				<InputRange
					{...xProps}
					ref={xRef}
					onKeyDown={onKeyDown}
					onBlur={onBlur}
					tabIndex={focusedParam === 'y' ? -1 : 0}
				/>
			)}
			{yProps && (
				<InputRange
					{...yProps}
					ref={yRef}
					onKeyDown={onKeyDown}
					onBlur={onBlur}
					tabIndex={-1}
				/>
			)}
		</>
	);
};

export default InputRange2D;
