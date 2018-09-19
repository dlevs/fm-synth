// Globals
declare global {
	interface Window {
		__REDUX_DEVTOOLS_EXTENSION__: any;
		AudioContext: typeof AudioContext;
		webkitAudioContext: typeof AudioContext;
	}
}

// App-specific types
export interface ADSREnvelope {
	attack: number;
	decay: number;
	sustain: number;
	release: number;
}

// React props
export interface RenderPropComponentProps<T> {
	children(passedArgs: T): JSX.Element;
}

// Utilities
export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export type Subtract<T, K> = Omit<T, keyof K>;
