import { MIDI_MIN, MIDI_MAX } from '../lib/scales'
import { PointConfig, Point } from '../lib/types'
import InputEnvelope from './InputEnvelope'

type Props = {
	value: number
	setValue: (value: number) => void
	orient?: 'vertical' | 'horizontal'
	color?: string
}

const height = 6
const yCenter = height / 2

const getPointsConfig = ({ value, orient }: Pick<Props, 'value' | 'orient'>): PointConfig[] => {
	const isVertical = orient === 'vertical'
	const flipPoint = ([x, y]: Point): Point => isVertical
		? [y, x]
		: [x, y]

	return [
		{ point: flipPoint([MIDI_MIN, yCenter]) },
		{
			point: flipPoint([value, yCenter]),
			[isVertical ? 'mapY' : 'mapX']: 'value'
		},
		{ point: flipPoint([MIDI_MAX - value, yCenter]) }
	]
}

export const InputRangeLine = ({
	value,
	setValue,
	orient = 'horizontal',
	color
}: Props) => (
	<InputEnvelope
		color={color}
		divideWidth={3}
		value={{ value }}
		setValue={({ value }) => setValue(value)}
		pointsConfig={getPointsConfig({ value, orient })}
	/>
)

export default InputRangeLine
