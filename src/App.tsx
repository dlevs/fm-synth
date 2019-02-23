import React, { useState } from 'react'
import InputADSR from './components/InputEnvelopeADSR'
import KeyboardMain from './containers/KeyboardMain'

// TODO: Move state to redux:
const App = () => {
	const [ADSRValue, setADSRValue] = useState({
		attack: 127,
		decay: 127,
		release: 127,
		sustain: 80
	})

	return (
		<>
			<InputADSR
				value={ADSRValue}
				setValue={setADSRValue}
			/>
			<KeyboardMain />
		</>
	)
}

export default App
