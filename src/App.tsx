import fromPairs from 'lodash/fromPairs';
import React, { Component } from 'react';
import InputADSR from './components/InputADSR';
import KeyboardMain from './containers/KeyboardMain';

class State {
	public adsrParams = {
		attack: 127,
		decay: 127,
		release: 127,
		sustain: 80,
	};
}

// TODO: Move state to redux:
class App extends Component {
	public state = new State();

	public onAdsrChange = (changes: [string, number][]) => {
		this.setState((prevState: State) => ({
			adsrParams: {
				...prevState.adsrParams,
				...fromPairs(changes),
			},
		}));
	};

	public render() {
		return (
			<>
				<InputADSR
					{...this.state.adsrParams}
					onChange={this.onAdsrChange}
				/>
				<KeyboardMain />
			</>
		);
	}
}

export default App;
