import React, { Component, Fragment } from 'react';
import InputADSR from './components/InputADSR';
import fromPairs from 'lodash/fromPairs';

// TODO: Make a generic "padding" property to widget to allow us space for this blur
const BLUR = 20;

const createAdsrStyle = (color) => (ctx, { step, isActive }) => {
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
  }
}

class App extends Component {
  state = {
    adsrParams: {
      attack: 127,
      decay: 127,
      sustain: 80,
      release: 127,
    },
  }

  onAdsrChange = (changes) => {
    const newParams = fromPairs(changes);
    // TODO: Does this need some abstraction, or just plain event?
    this.setState(({ adsrParams }) => ({
      adsrParams: {
        ...adsrParams,
        ...newParams,
      }
    }));
  }

  render() {
    return (
      <Fragment>
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
      </Fragment>
    )
  }
}

export default App;
