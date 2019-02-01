import React, {
	KeyboardEvent,
	FocusEvent,
	HTMLProps,
	Ref,
	useState,
	useRef,
	useImperativeHandle,
	forwardRef,
} from 'react';
import InputRange, { Props as InputRangeProps } from './InputRange';

interface Props extends HTMLProps<HTMLInputElement> {
	xProps?: InputRangeProps;
	yProps?: InputRangeProps;
}

const createLabel = (
	primaryProps: InputRangeProps,
	secondaryProps: InputRangeProps | undefined,
	keys: string[],
) => {
	if (!secondaryProps || !secondaryProps.label) {
		return primaryProps.label;
	}

	return `${primaryProps.label} (press ${keys.join(' or ')} for ${secondaryProps.label})`;
};

/**
 * Two range inputs that may be interacted with as though they were a single input.
 *
 * When using keyboard controls, the user may pres TAB to move focus to one of the
 * input elements. Pressing TAB again moves focus to the next element outside of
 * this component, and not the next input field.
 *
 * Pressing LEFT or RIGHT will focus the "x" input and change the value.
 * Pressing UP or DOWN will focus the "y" input and change the value.
 *
 * This is likely most useful as a hidden input field to provide keyboard
 * accessibility to an otherwise unaccessible widget.
 */
export const InputRange2D = (
	{ xProps, yProps, ...sharedProps }: Props,
	ref: Ref<HTMLInputElement>,
) => {
	const xRef = useRef(null as null | HTMLInputElement);
	const yRef = useRef(null as null | HTMLInputElement);
	const [focusedParam, setFocusedParam] = useState(null as null | 'x' | 'y');

	// TODO: Test these methods by using this in InputEnvelope.tsx
	useImperativeHandle(ref, () => ({
		focus: () => {
			if (xRef.current) {
				xRef.current.focus();
			}
		},
		blur: () => {
			if (document.activeElement == null) {
				return;
			}
			if (document.activeElement === xRef.current) {
				xRef.current.blur();
			} else if (document.activeElement === yRef.current) {
				yRef.current.blur();
			}
		},
	}));

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

	return <>
		{xProps && (
			<InputRange
				{...sharedProps}
				{...xProps}
				label={createLabel(xProps, yProps, ['left', 'right'])}
				ref={xRef}
				tabIndex={focusedParam === 'y' ? -1 : 0}
				{...sharedPropsInternal}
			/>
		)}
		{yProps && (
			<InputRange
				{...sharedProps}
				{...yProps}
				label={createLabel(yProps, xProps, ['up', 'down'])}
				ref={yRef}
				tabIndex={xProps ? -1 : 0}
				{...sharedPropsInternal}
			/>
		)}
	</>;
};

export default forwardRef(InputRange2D);
