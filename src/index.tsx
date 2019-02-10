import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './App'
import store from './store'
import './index.css'
import midiRespond from './lib/midiRespond'
import registerServiceWorker from './registerServiceWorker'

// TODO: rename
midiRespond(store)

ReactDOM.render(
	<StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	</StrictMode>,
	document.getElementById('root') as HTMLElement
)
registerServiceWorker()
