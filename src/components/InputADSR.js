import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import upperFirst from 'lodash/upperFirst';
import { css } from 'emotion';
import { findClosestIndex } from 'find-closest';

const POINT_RADIUS = 2;
const POINT_RADIUS_ACTIVE = 4;
const BLUR = 20;
const RADIUS_WITH_BLUR = POINT_RADIUS_ACTIVE + (BLUR / 2);
const POINT_HITBOX_SIZE = 30;
const INPUT_MAX = 127;
const SUSTAIN_WIDTH = 0.5;
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

const ADSRInputField = ({ id, label, inputRef, ...otherProps }) => (
  <Fragment>
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      type="range"
      step="1"
      min="0"
      max={INPUT_MAX}
      ref={inputRef}
      {...otherProps}
    />
  </Fragment>
)

export default class InputADSR extends Component {
  state = {
    isMouseDown: false,
    isMouseOver: false,
    activeInput: null
  };
  id = uniqueIDCounter++;

  getCurrentCoordinates = (props) => {
    const { attack, decay, sustain, release } = props;
    const { canvas } = this;
    // TODO: maybe abstract away the need to manually specify RADIUS_WITH_BLUR offset
    const heightStep = (canvas.height - (2 * RADIUS_WITH_BLUR)) / INPUT_MAX;
    const widthPerParam = (canvas.width - (2 * RADIUS_WITH_BLUR)) / (params.length - 1 + SUSTAIN_WIDTH);
    const widthStep = widthPerParam / INPUT_MAX;
    const xTop = RADIUS_WITH_BLUR;
    const xBottom = canvas.height - RADIUS_WITH_BLUR;
    const ySustain = canvas.height - (sustain * heightStep) - RADIUS_WITH_BLUR;
    const offset = value => (value * widthStep) + RADIUS_WITH_BLUR;

    return [
      [
        RADIUS_WITH_BLUR,
        xBottom
      ],
      [
        (attack * widthStep) + RADIUS_WITH_BLUR,
        xTop
      ],
      [
        ((attack + decay) * widthStep) + RADIUS_WITH_BLUR,
        ySustain
      ],
      [
        ((attack + decay) * widthStep) + (widthPerParam * SUSTAIN_WIDTH) + RADIUS_WITH_BLUR,
        ySustain
      ],
      [
        ((attack + decay + release) * widthStep) + (widthPerParam * SUSTAIN_WIDTH) + RADIUS_WITH_BLUR,
        xBottom
      ],
    ]
  }

  applyUserCanvasContext(props, state, step) {
    if (props.setCanvasContext) {
      props.setCanvasContext(this.ctx, {
        isActive: state.activeInput || state.isMouseOver,
        step
      });
    }
  }

  updateCanvas = (props, state) => {
    const { ctx, canvas } = this;
    const points = this.getCurrentCoordinates(props);
    const focusedPointIndex = this.getFocusedElemIndex(state);

    clearCanvas(ctx);
    ctx.lineJoin  = 'bevel';

    this.applyUserCanvasContext(props, state, 'pre-draw-lines');
    ctx.beginPath();
    points.forEach(([x, y], i) => {
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    this.applyUserCanvasContext(props, state, 'pre-draw-points');
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
      // First point on the canvas is not interactive, so it should be undefined
      undefined,
      ...params.map(({ name }) => this[name]),
    ]
  }

  componentDidMount() {
    this.ctx = this.canvas.getContext('2d');
    this.updateCanvas(this.props, this.state);
    document.addEventListener('mouseup', this.onDocumentMouseUp)
  }

  componentWillUnmount() {
    // TODO: Look for an npm package that will handle event definition + teardown do reduce this duplication
    document.removeEventListener('mouseup', this.onDocumentMouseUp)
  }

  componentWillUpdate(props, state) {
    this.updateCanvas(props, state);
  }

  onMouseDown = (event) => {
    this.setState({ isMouseDown: true });
    event.preventDefault();
  }

  onDocumentMouseUp = () => {
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
          <ADSRInputField
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
          height="200"
          className={classnames(adsrCanvas, {[adsrCanvasGrabbing]: isMouseDown})}
          onMouseMove={this.onCanvasMouseMove}
          onMouseDown={this.onMouseDown}
        />
      </div>
    )
  }
}
