import fromPairs from 'lodash/fromPairs';
import React, { Component } from 'react';
import InputADSR from './components/InputADSR';
import KeyboardMain from './containers/KeyboardMain';
import { Settings } from './store/settingsReducer';
import { connect } from 'react-redux';
import { Store } from './store';

const BLUR = 20;

const createAdsrStyle = (color: string) => (
	ctx: CanvasRenderingContext2D,
	{ step, isActive }: { step: string; isActive: boolean },
	) => {
	switch (step) {
		case 'pre-draw-lines':
			ctx.lineWidth = 2;
			ctx.shadowBlur = BLUR;
			ctx.strokeStyle = color;
			ctx.fillStyle = color;
			ctx.shadowColor = color;
			break;

		case 'pre-draw-points':
			if (!isActive) {
				break;
			}

			ctx.save();
			ctx.globalAlpha = 0.04;
			ctx.fill();
			ctx.restore();
			break;

		default:
	}
};

class State {
	public adsrParams = {
		attack: 127,
		decay: 127,
		release: 127,
		sustain: 80,
	};
}

const TestSettings = connect(
	({ settings }: Store) => settings,
)(
	({ baseFrequency, polyphony }: Settings) =>
		<ul>
			<li>baseFrequency: {baseFrequency}Hz</li>
			<li>polyphony: {polyphony} voices</li>
		</ul>,
);

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
					padding={BLUR / 2}
					setCanvasContext={createAdsrStyle('#4286f4')}
					{...this.state.adsrParams}
					onChange={this.onAdsrChange}
				/>
				<KeyboardMain />
				<TestSettings />
				<input type='range' />
			</>
		);
	}
}

export default App;
