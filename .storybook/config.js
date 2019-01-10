import { configure, addDecorator } from '@storybook/react';
import { withOptions } from '@storybook/addon-options';
import { withKnobs } from '@storybook/addon-knobs';
import { withInfo } from '@storybook/addon-info';

function loadStories() {
  require('../src/stories');
}

addDecorator(withOptions({
	addonPanelInRight: true,
}));
addDecorator(withKnobs);
addDecorator(withInfo({
	inline: true,
	maxPropObjectKeys: 15,
	maxPropArrayLength: 15,
}));

configure(loadStories, module);
