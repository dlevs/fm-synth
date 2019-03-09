import { MIDI_MIN, MIDI_MAX } from '../lib/scales'
import { ADSREnvelope, PointConfig } from '../lib/types'
import InputEnvelope, { getDivideWidth } from './InputEnvelope'

type Props = {
	value: ADSREnvelope
	setValue: (value: ADSREnvelope) => void
	color?: string
}

const maxEnvelope: ADSREnvelope = {
	attack: MIDI_MAX,
	decay: MIDI_MAX,
	sustain: MIDI_MAX,
	release: MIDI_MAX
}

const getPointsConfig = ({
	attack,
	decay,
	sustain,
	release
}: typeof maxEnvelope): PointConfig[] => [
	{
		point: [MIDI_MIN, MIDI_MAX]
	},
	{
		point: [attack, MIDI_MIN],
		mapX: 'attack'
	},
	{
		point: [decay, MIDI_MAX - sustain],
		mapX: 'decay',
		mapY: 'sustain'
	},
	{
		point: [MIDI_MAX / 2, MIDI_MAX - sustain]
	},
	{
		point: [release, MIDI_MAX],
		mapX: 'release'
	}
]

const divideWidth = getDivideWidth(maxEnvelope, getPointsConfig)

export const InputEnvelopeADSR = ({
	value,
	setValue,
	color
}: Props) => (
	<InputEnvelope
		color={color}
		divideWidth={divideWidth}
		value={value}
		setValue={setValue}
		pointsConfig={getPointsConfig(value)}
	/>
)

export default InputEnvelopeADSR
