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

export interface Note {
	note: number;
	velocity: number;
}

export interface NoteStatus extends Note {
	isReleased: boolean;
	isSostenuto: boolean;
}

export interface OscillatorBase {
	id: string;
	waveType: OscillatorType;
	envelope: ADSREnvelope;
}

export interface OscillatorFixed extends OscillatorBase {
	mode: 'fixed';
	frequency: number;
}

export interface OscillatorRatio extends OscillatorBase {
	mode: 'ratio';
	ratio: number;
}

export type Oscillator = OscillatorFixed | OscillatorRatio;

// Utilities
export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
export type Subtract<T, K> = Omit<T, keyof K>;
export type ValueOf<T> = T[keyof T];
export type PropsOf<F> = F extends (props: infer P) => any ? P : never;
