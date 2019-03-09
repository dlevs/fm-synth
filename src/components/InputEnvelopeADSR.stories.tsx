import createInputEnvelopeStories from '../lib/storybook/createInputEnvelopeStories'
import InputEnvelopeADSR from './InputEnvelopeADSR'

createInputEnvelopeStories(InputEnvelopeADSR, {
	attack: 100,
	decay: 100,
	sustain: 70,
	release: 100
})
