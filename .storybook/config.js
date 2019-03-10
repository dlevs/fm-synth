import requireContext from 'require-context.macro'
import { configure, addDecorator } from '@storybook/react'
import { withKnobs } from '@storybook/addon-knobs'

const req = requireContext('../src', true, /\.stories\.(js|ts)x?$/)

function loadStories() {
	req.keys().forEach(filename => req(filename))
}

addDecorator(withKnobs)

configure(loadStories, module)
