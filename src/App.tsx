import fromPairs from 'lodash/fromPairs';
import React, { Component } from 'react';
import InputADSR from './components/InputADSR';

const BLUR = 20;

const createAdsrStyle = (color: string) => (
  ctx: CanvasRenderingContext2D,
  { step, isActive }: { step: string, isActive: boolean }
 ) => {
  switch(step) {
    case 'pre-draw-lines':
      ctx.lineWidth = 2;
      ctx.shadowBlur = BLUR;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      break;

    case 'pre-draw-points':
      if (isActive) {
        ctx.save();
        ctx.globalAlpha = 0.04
        ctx.fill()
        ctx.restore();
      }
      break;

    default:
      break;
  }
}

class State {
  public adsrParams = {
    attack: 127,
    decay: 127,
    release: 127,
    sustain: 80,
  }
}

class App extends Component {
  public state = new State;

  public onAdsrChange = (changes: Array<[string, number]>) => {
    this.setState((prevState: State) => ({
      adsrParams: {
        ...prevState.adsrParams,
        ...fromPairs(changes),
      }
    }));
  }

  public render() {
    return (
      <>
        <InputADSR
          padding={BLUR / 2}
          setCanvasContext={createAdsrStyle('#4286f4')}
          {...this.state.adsrParams}
          onChange={this.onAdsrChange}
        />
        <InputADSR
          padding={BLUR / 2}
          setCanvasContext={createAdsrStyle('#f44d41')}
          {...this.state.adsrParams}
          onChange={this.onAdsrChange}
        />
        <InputADSR {...this.state.adsrParams} onChange={this.onAdsrChange} />
      </>
    )
  }
}

export default App;
