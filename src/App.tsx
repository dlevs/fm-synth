import fromPairs from 'lodash/fromPairs';
import React, { Component } from 'react';
import InputADSR from './components/InputADSR';

// TODO: Make a generic "padding" property to widget to allow us space for this blur
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

class App extends Component {
  public state = {
    adsrParams: {
      attack: 127,
      decay: 127,
      release: 127,
      sustain: 80,
    },
  }

  public onAdsrChange = (changes: Array<[string, number]>) => {
    // TODO: Use function for updating state based on previous state
    this.setState({
      adsrParams: {
        ...this.state.adsrParams,
        ...fromPairs(changes),
      }
    });
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
