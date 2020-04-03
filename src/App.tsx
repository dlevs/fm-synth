import { StrictMode, useState } from 'react'
import InputADSR from './components/InputEnvelopeADSR.js'
import KeyboardMain from './containers/KeyboardMain.js'

// TODO: Move state to redux:
const App = () => {
	const [ADSRValue, setADSRValue] = useState({
		attack: 127,
		decay: 127,
		release: 127,
		sustain: 80
	})

	return (
		<StrictMode>
			<InputADSR
				value={ADSRValue}
				setValue={setADSRValue}
			/>
			<KeyboardMain />
		</StrictMode>
	)
}

export default App
