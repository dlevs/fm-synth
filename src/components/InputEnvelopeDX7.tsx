import { MIDI_MIN, MIDI_MAX } from '../lib/scales'
import { DX7Envelope, PointConfig } from '../lib/types'
import InputEnvelope, { getDivideWidth } from './InputEnvelope'

type Props = {
	value: DX7Envelope
	setValue: (value: DX7Envelope) => void
	color?: string;
}

const maxEnvelope: DX7Envelope = {
	rate1: MIDI_MAX,
	rate2: MIDI_MAX,
	rate3: MIDI_MAX,
	rate4: MIDI_MAX,
	level1: MIDI_MAX,
	level2: MIDI_MAX,
	level3: MIDI_MAX,
	level4: MIDI_MAX
}

const labels = {
	rate1: 'Rate 1',
	rate2: 'Rate 2',
	rate3: 'Rate 3',
	rate4: 'Rate 4',
	level1: 'Level 1',
	level2: 'Level 2',
	level3: 'Level 3',
	level4: 'Level 4'
}

const getPointsConfig = ({
	rate1,
	rate2,
	rate3,
	rate4,
	level1,
	level2,
	level3,
	level4
}: typeof maxEnvelope): PointConfig[] => [
	{
		point: [MIDI_MIN, MIDI_MAX]
	},
	{
		point: [rate1, MIDI_MAX - level1],
		mapX: 'rate1',
		mapY: 'level1'
	},
	{
		point: [rate2, MIDI_MAX - level2],
		mapX: 'rate2',
		mapY: 'level2'
	},
	{
		point: [rate3, MIDI_MAX - level3],
		mapX: 'rate3',
		mapY: 'level3'
	},
	{
		point: [MIDI_MAX / 2, MIDI_MAX - level3]
	},
	{
		point: [rate4, MIDI_MAX - level4],
		mapX: 'rate4',
		mapY: 'level4'
	}
]

const divideWidth = getDivideWidth(maxEnvelope, getPointsConfig)

export const InputEnvelopeDX7 = ({
	value,
	setValue,
	color
}: Props) => (
	<InputEnvelope
		color={color}
		divideWidth={divideWidth}
		value={value}
		setValue={setValue}
		labels={labels}
		pointsConfig={getPointsConfig(value)}
		guides
	/>
)

export default InputEnvelopeDX7
