import React, { Component, Fragment } from 'react';
import InputADSR from './components/InputADSR';

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
      attack: 40,
      decay: 40,
      sustain: 43,
      release: 120,
    },
  }

  onAdsrChange = ({ target }) => {
    // TODO: Does this need some abstraction, or just plain event?
    this.setState(({ adsrParams }) => ({
      adsrParams: {
        ...adsrParams,
        [target.name]: Number(target.value),
      }
    }));
  }

  render() {
    return (
      <Fragment>
        {/* TODO: Implement padding, pointRadius and pointRadiusActive */}
        {/* TODO: Or... account also for the largest point */}
        <InputADSR padding={BLUR / 2} setCanvasContext={createAdsrStyle('#4286f4')} {...this.state.adsrParams} onChange={this.onAdsrChange} />
        <InputADSR padding={BLUR / 2} setCanvasContext={createAdsrStyle('#f44d41')} {...this.state.adsrParams} onChange={this.onAdsrChange} />
        <InputADSR {...this.state.adsrParams} onChange={this.onAdsrChange} />
      </Fragment>
    );
  }
}

export default App;
