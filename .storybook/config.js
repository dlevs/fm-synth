import { configure, addDecorator } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import { withInfo } from '@storybook/addon-info';

// automatically import all files ending in *.stories.js
const req = require.context('../src/stories', true, /.stories.tsx?$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

addDecorator(withKnobs)
addDecorator(withInfo({
	inline: true,
	maxPropObjectKeys: 15,
}))

configure(loadStories, module);
