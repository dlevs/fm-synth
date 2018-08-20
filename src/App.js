import React, { Component, Fragment } from 'react';
import logo from './logo.svg';
import './App.css';
import classnames from 'classnames';
import upperFirst from 'lodash/upperFirst';
import { css } from 'emotion';
import { findClosestIndex } from 'find-closest';

const POINT_RADIUS = 2;
const POINT_RADIUS_ACTIVE = 6;
const BLUR = 20;
const RADIUS_WITH_BLUR = POINT_RADIUS_ACTIVE + (BLUR / 2);
const POINT_HITBOX_SIZE = 30;
let uniqueIDCounter = 0;
// TODO: make a standard for referencing x, y coordinates. E.g., ALWAYS use an array, or ALWAYS an object. not both

const params = ['attack', 'decay', 'sustain', 'release'].map(name => ({
  name,
  label: upperFirst(name),
}));

const adsrCanvas = css`
  cursor: grab;
`;
const adsrCanvasGrabbing = css`
  cursor: grabbing;
`;

const clearCanvas = (ctx) => {
  const { canvas } = ctx;

  ctx.clearRect(0, 0, canvas.width, canvas.height)
}
const drawCircle = (ctx, x, y, radius) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.stroke();
}

const getRelativeMouseCoordinates = (event) => {
  const bounds = event.target.getBoundingClientRect();

  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top
  };
}

const ADSRInput = ({ id, label, inputRef, ...otherProps }) => (
  <Fragment>
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      type="range"
      step="1"
      min="0"
      max="127"
      ref={inputRef}
      {...otherProps}
    />
  </Fragment>
)

class ADSR extends Component {
  state = {
    isMouseDown: false,
    isMouseOver: false,
    activeInput: null
  };
  id = uniqueIDCounter++;

  getCurrentCoordinates = (props) => {
    const { attack, decay, sustain, release } = props;
    const { canvas } = this;
    // TODO: rename
    const offset = value => (value * 30) + RADIUS_WITH_BLUR;
    const xTop = RADIUS_WITH_BLUR;
    const xBottom = canvas.height - RADIUS_WITH_BLUR;
    // TODO: Got lost in this one... make sure it makes sense:
    const ySustain = canvas.height - ((sustain * (canvas.height - (2 * RADIUS_WITH_BLUR))) + RADIUS_WITH_BLUR)
    const widthSustain = 50;

    return [
      [RADIUS_WITH_BLUR, xBottom],
      [offset(attack), xTop],
      [offset(attack + decay), ySustain],
      [offset(attack + decay) + widthSustain, ySustain],
      [offset(attack + decay + release) + widthSustain, xBottom],
    ]
  }

  updateCanvas = (props, state) => {
    const { canvas } = this;
    const ctx = canvas.getContext('2d');
    const focusedPointIndex = this.getFocusedElemIndex(state);
    // TODO: move these out to  a styling fn

    ctx.lineJoin  = 'bevel';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#4286f4';
    ctx.strokeStyle = '#4286f4';
    ctx.shadowBlur = BLUR;
    ctx.shadowColor = '#4286f4';


    clearCanvas(ctx);

    const points = this.getCurrentCoordinates(props);

    ctx.beginPath();
    points.forEach(([x, y], i) => {
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // TODO: make this an external fn for on active/ hover
    if (state.activeInput || state.isMouseOver) {
      ctx.save();
      ctx.globalAlpha = 0.08
      ctx.fill()
      ctx.restore();
    }

    points.forEach(([x, y], i) => {
      const radius = i === focusedPointIndex
        ? POINT_RADIUS_ACTIVE
        : POINT_RADIUS;

      drawCircle(ctx, x, y, radius);
    });
  }

  getClosestPoint(x, y) {
    const points = this.getCurrentCoordinates(this.props);
    const distances = points.map(([x2, y2]) => Math.abs(x - x2) + Math.abs(y - y2));
    const index = findClosestIndex(distances, 0);

    return {
      distance: distances[index],
      point: points[index],
      inputElement: this.getPointIndexMap()[index],
      index
    }
  }

  onCanvasMouseMove = (event) => {
    const { x, y } = getRelativeMouseCoordinates(event);
    const { inputElement, distance } = this.getClosestPoint(x, y);

    if (inputElement && distance < POINT_HITBOX_SIZE) {
      if (inputElement !== document.activeElement) {
        inputElement.focus();
      }
    } else if (this.state.activeInput && !this.state.isMouseDown) {
      this.state.activeInput.blur();
    }
  }

  getFocusedElemIndex(state) {
    // TODO: This fn is naff now it has an argument. May be wrong abstraction
    state = state || this.state;
    if (!state.activeInput) return null;

    return this.getPointIndexMap().indexOf(state.activeInput);
  }

  getPointIndexMap() {
  	return [
      undefined,
      ...params.map(({ name }) => this[name]),
    ]
  }

  componentDidMount() {
    this.updateCanvas(this.props, this.state);
  }

  componentWillUpdate(props, state) {
    this.updateCanvas(props, state);
  }

  onMouseDown = (event) => {
    this.setState({ isMouseDown: true });
    event.preventDefault();
  }

  onMouseUp = () => {
    this.setState({ isMouseDown: false });
  }

  onMouseEnter = () => {
    this.setState({ isMouseOver: true })
  }

  onMouseLeave = () => {
    this.setState({ isMouseOver: false })
  }

  onFocus = () => {
    this.setState({ activeInput: document.activeElement })
  }

  onBlur = () => {
    this.setState({ activeInput: null })
  }

  render() {
    const { onChange } = this.props;
    const { isMouseDown } = this.state;

    return (
      <div
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        {params.map(({ label, name }) => (
          <ADSRInput
            id={`adsr-${name}-${this.id}`}
            label={label}
            key={name}
            name={name}
            value={this.props[name]}
            onChange={onChange}
            inputRef={el => this[name] = el}
          />
        ))}
        <canvas
          ref={el => this.canvas = el}
          width="500"
          height="400"
          className={classnames(adsrCanvas, {[adsrCanvasGrabbing]: isMouseDown})}
          onMouseMove={this.onCanvasMouseMove}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
        />
      </div>
    )
  }
}

class App extends Component {
  state = {
    adsrParams: {
      attack: 1,
      decay: 1,
      sustain: 0.4,
      release: 2,
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
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Are you looking at my screen, Bay?</h1>
        </header>
        <ADSR {...this.state.adsrParams} onChange={this.onAdsrChange} />
        <ADSR {...this.state.adsrParams} onChange={this.onAdsrChange} />
        <ADSR {...this.state.adsrParams} onChange={this.onAdsrChange} />
      </div>
    );
  }
}

export default App;
