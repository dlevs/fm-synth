import { useCallback } from 'react';

const useCallbacks = (
	callbacks: ((...args: any[]) => void)[],
	inputs: any[],
) =>
	useCallback((...args) => {
		callbacks.forEach(callback => {
			callback(...args);
		});
	}, inputs);

export default useCallbacks;
