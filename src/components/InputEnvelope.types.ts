import { ValueProps, PointConfig } from '../lib/types'

export interface Props<T> extends ValueProps<T> {
	divideWidth: number
	pointsConfig: PointConfig[]
	color?: string
}

// TODO: This file only exists because this type breaks syntax highlighting. See if it can be fixed and moved back into main file:
export type InputEnvelopeType = <T extends object>(props: Props<T>) => React.ReactElement<Props<T>>
