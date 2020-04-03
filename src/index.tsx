import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './App.js'
import store from './store/index.js'
import midiRespond from './lib/midiRespond.js'
// import registerServiceWorker from './registerServiceWorker'

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
// registerServiceWorker()
