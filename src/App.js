import React, { Component, Fragment } from 'react';
import InputADSR from './components/InputADSR';

class App extends Component {
  state = {
    adsrParams: {
      attack: 3,
      decay: 20,
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
        <InputADSR {...this.state.adsrParams} onChange={this.onAdsrChange} />
        <InputADSR {...this.state.adsrParams} onChange={this.onAdsrChange} />
        <InputADSR {...this.state.adsrParams} onChange={this.onAdsrChange} />
      </Fragment>
    );
  }
}

export default App;
