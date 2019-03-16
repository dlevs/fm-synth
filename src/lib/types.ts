// Globals
declare global {
	var webkitAudioContext: typeof AudioContext
}

// App-specific types
export type Point = [number, number]

export interface RelativePoint {
	constrained: Point;
	unconstrained: Point;
}

export interface PointConfig {
	point: Point;
	mapX?: string;
	mapY?: string;
}

export interface ADSREnvelope {
	attack: number;
	decay: number;
	sustain: number;
	release: number;
}

export interface DX7Envelope {
	rate1: number;
	rate2: number;
	rate3: number;
	rate4: number;
	level1: number;
	level2: number;
	level3: number;
	level4: number;
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

export type Oscillator = OscillatorFixed | OscillatorRatio

// Utilities
export interface ObjectOf<T> { [key: string]: T }

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
export type Subtract<T, K> = Omit<T, keyof K>
export type ValueOf<T> = T[keyof T]
