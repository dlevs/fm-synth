import React, { Component } from 'react'
import InputADSR from './components/InputEnvelopeADSR'
import KeyboardMain from './containers/KeyboardMain'
import { ADSREnvelope } from './lib/types'

class State {
	public adsrParams = {
		attack: 127,
		decay: 127,
		release: 127,
		sustain: 80
	}
}

// TODO: Move state to redux:
class App extends Component {
	public state = new State()

	public onAdsrChange = (changes: ADSREnvelope) => {
		console.log('onAdsrChange', changes)
		this.setState(changes)
	}

	public render () {
		return (
			<>
				<InputADSR
					value={this.state.adsrParams}
					setValue={this.onAdsrChange}
				/>
				<KeyboardMain />
			</>
		)
	}
}

export default App
