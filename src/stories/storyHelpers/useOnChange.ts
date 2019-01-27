import { useState } from 'react';
import { action } from '@storybook/addon-actions';

// TODO: Can this be a hook?
function useOnChange <T>(initialValue: T) {
	const [value, onChange] = useState(initialValue);

	return {
		value,
		onChange: (newValue: T) => {
			action('onChange')(newValue);
			onChange(newValue);
		},
	};
}

export default useOnChange;
