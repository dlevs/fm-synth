import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import store from './store';
// tslint:disable-next-line:no-import-side-effect
import './index.css';
import midiRespond from './lib/midiRespond';
import registerServiceWorker from './registerServiceWorker';

// TODO: rename
midiRespond(store);

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root') as HTMLElement,
);
registerServiceWorker();
