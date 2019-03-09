import createInputEnvelopeStories from '../lib/storybook/createInputEnvelopeStories'
import InputEnvelopeDX7 from './InputEnvelopeDX7'

createInputEnvelopeStories(InputEnvelopeDX7, {
	rate1: 100,
	rate2: 127,
	rate3: 100,
	rate4: 100,
	level1: 100,
	level2: 80,
	level3: 30,
	level4: 0
})
