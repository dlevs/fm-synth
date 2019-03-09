import requireContext from 'require-context.macro';
import { configure, addDecorator } from '@storybook/react';
import { withOptions } from '@storybook/addon-options';
import { withKnobs } from '@storybook/addon-knobs';
import { withInfo } from '@storybook/addon-info';

const req = requireContext('../src', true, /\.stories\.+(js|ts)x?$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

addDecorator(withKnobs);
addDecorator(withInfo({
	inline: true,
	maxPropObjectKeys: 15,
	maxPropArrayLength: 15,
}));

configure(loadStories, module);
