import fromPairs from 'lodash/fromPairs';
import React, { Component } from 'react';
import InputADSRSimplified from './components/InputADSRSimplified';
import KeyboardMain from './containers/KeyboardMain';

class State {
	public adsrParams = {
		attack: 20,
		decay: 40,
		release: 100,
		sustain: 40,
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
				<InputADSRSimplified
					{...this.state.adsrParams}
					onChange={this.onAdsrChange}
				/>
				<KeyboardMain />
			</>
		);
	}
}

export default App;
