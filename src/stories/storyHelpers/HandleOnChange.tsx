import { useState } from 'react';
import { action } from '@storybook/addon-actions';

interface Props<T> {
	children(props: { value: T; onChange(value: T): void }): JSX.Element;
	initialValue: T;
}

function HandleOnChange <T>({ initialValue, children }: Props<T>) {
	const [value, onChange] = useState(initialValue);

	return children({
		value,
		onChange: (...args) => {
			action('onChange')(...args);
			onChange(...args);
		},
	});
}

export default HandleOnChange;
