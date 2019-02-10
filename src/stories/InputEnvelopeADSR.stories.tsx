import createInputEnvelopeStories from './storyHelpers/createInputEnvelopeStories'
import InputEnvelopeADSR from '../components/InputEnvelopeADSR'

createInputEnvelopeStories(InputEnvelopeADSR, {
	attack: 100,
	decay: 100,
	sustain: 70,
	release: 100
})
