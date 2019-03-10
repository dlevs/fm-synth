import { PointConfig } from '../lib/types'

export interface Props<T> {
	value: T
	setValue: (value: T) => void
	labels: { [P in keyof T]: string }
	divideWidth: number
	pointsConfig: PointConfig[]
	guides?: boolean
	color?: string
}

// TODO: This file only exists because this type breaks syntax highlighting. See if it can be fixed and moved back into main file:
export type InputEnvelopeType = <T extends object>(props: Props<T>) => React.ReactElement<Props<T>>
