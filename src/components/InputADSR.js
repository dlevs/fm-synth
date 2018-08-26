import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import sumBy from 'lodash/sumBy';
import upperFirst from 'lodash/upperFirst';
import { css } from 'emotion';
import { findClosestIndex } from 'find-closest';
import EventManager from '../lib/EventManager';
import { clearCanvas, drawCircle, resizeCanvas } from '../lib/canvasUtils';

let uniqueIDCounter = 0;
// TODO: make a standard for referencing x, y coordinates. E.g., ALWAYS use an array, or ALWAYS an object. not both

// TODO: Better name?
const getParamMultiplier = name => ({ inputMax, ...params }) => params[name] / inputMax;

// TODO: Rename
const params = [
  {
    name: 'start',
    hasControls: false,
    editable: false,
    width: 0,
    calculateX: () => 0,
    calculateY: () => 1,
  },
  {
    name: 'attack',
    calculateY: () => 0,
  },
  {
    name: 'decay',
    mapY: 'sustain',
    calculateY: getParamMultiplier('sustain'),
  },
  {
    name: 'sustain',
    mapY: 'sustain',
    calculateY: getParamMultiplier('sustain'),
    calculateX: () => 1,
    mapX: null,
    width: 0.5,
    editable: false
  },
  {
    name: 'release',
    calculateY: () => 1,
  },
].map((param, index, array) => {
  const mapX = param.mapX || param.name;
  const mapXIndex = array.findIndex(({ name }) => name === mapX);
  const mapYIndex = array.findIndex(({ name }) => name === param.mapY);

  return {
    label: upperFirst(param.name),
    mapX,
    mapXIndex,
    mapYIndex: mapYIndex !== -1 ? mapYIndex : null,
    calculateX: getParamMultiplier(param.name),
    width: 1,
    editable: true,
    // TODO: Be consistent with the property naming
    hasControls: true,
    ...param
  }
});
const paramWidthTotal = sumBy(params, 'width');

const adsrCanvas = css`
  cursor: grab;
  touch-action: none;
  width: 100%;
  display: block;
`;
const adsrCanvasGrabbing = css`
  cursor: grabbing;
`;
// TODO: Move me
const visuallyHidden = css`
  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  height: 1px; width: 1px;
  margin: -1px; padding: 0; border: 0;
`;


// TODO: Move to util file
const getRelativeMouseCoordinates = (event, element) => {
  const bounds = (element || event.target).getBoundingClientRect();
  const touch = event.touches ? event.touches[0] : null;
  // TODO: Can "pageY" be used instead of "clientY" for mouse events? for consistency
  const pageX = touch ? touch.pageX : event.clientX;
  const pageY = touch ? touch.pageY : event.clientY;

  return {
    x: pageX - bounds.left,
    y: pageY - bounds.top
  };
}

const ADSRInputField = ({ id, label, inputRef, inputMin, inputMax, ...otherProps }) => (
  <div className={visuallyHidden}>
    <label htmlFor={id}>{label}</label>
    <input
      id={id}
      type="range"
      step="1"
      min={inputMin}
      max={inputMax}
      ref={inputRef}
      {...otherProps}
    />
  </div>
)

export default class InputADSR extends Component {
  state = {
    isMouseDown: false,
    isMouseOver: false,
    focusedInput: null,
    activePointIndex: null
  };

  id = uniqueIDCounter++;

  static defaultProps = {
    inputMin: 0,
    inputMax: 127,
    pointHitboxMouse: 30,
    pointRadius: 2,
    pointRadiusActive: 4,
    padding: 0,

    // TODO: Are these good default values?
    width: 'fill',
    height: 200
  }

  getMaxPointRadius(props) {
    const { pointRadius, pointRadiusActive } = props || this.props;
    return Math.max(pointRadius, pointRadiusActive);
  }

  getOffset(props) {
    props = props || this.props;
    return this.getMaxPointRadius(props) + props.padding;
  }

  getPointOffsetX(i) {
    const point = this.getCurrentCoordinates(this.props)[i - 1];
    const rawPointX = point ? point[0] : 0;

    return rawPointX;
  }

  getCanvasOffsetWidth() {
    return this.canvas.width - (2 * this.getOffset());
  }

  getCanvasOffsetHeight() {
    return this.canvas.height - (2 * this.getOffset());
  }

  // TODO: Break this class down into smaller helper functions.
  getCurrentCoordinates = (props) => {
    const offset = this.getOffset(props);
    const width = this.getCanvasOffsetWidth();
    const height = this.getCanvasOffsetHeight();

    // TODO: Maybe use a single loop here, or reduce
    return params
      .reduce((points, { name, calculateX, calculateY }, i) => {
        // TODO: Should these calculations with "paramWidthTotal" and "params[i].width" be higher up?
        let x = (calculateX(props) / paramWidthTotal) * params[i].width;
        let y = calculateY(props);

        if (i !== 0) {
          const [lastX] = points[i - 1];
          x += lastX;
        }

        return points.concat([[x, y]]);
      }, [])
      // Do we need another loop for this?
      .map(([x, y]) => [
        (x * width) + offset,
        (y * height) + offset
      ]);
  }

  applyUserCanvasContext(props, state, step) {
    if (props.setCanvasContext) {
      props.setCanvasContext(this.ctx, {
        isActive: (state.activePointIndex && state.isMouseDown) || state.isMouseOver,
        step
      });
    }
  }

  updateCanvas = (props, state) => {
    const { ctx, canvas } = this;
    const { activePointIndex } = state;

    resizeCanvas(ctx, props.width, props.height);
    clearCanvas(ctx);

    // TODO: extract to another fn
    const points = this.getCurrentCoordinates(props);

    ctx.lineJoin = 'bevel';

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
      const param = params[i];
      if (!param || !param.editable) {
        return;
      }

      const radius = i === activePointIndex
        ? props.pointRadiusActive
        : props.pointRadius;

      drawCircle(ctx, x, y, radius);
    });
  }

  // TODO: be consistent with parameter naming "index" vs "i"
  getPoint(index) {
    // TODO: Be consistent with naming "point" vs "coordinate"
    return this.getCurrentCoordinates()[index];
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

  // TODO: hitbox param should be a level above
  getClosestPointToEvent(event, hitbox) {
    const { x, y } = getRelativeMouseCoordinates(event);
    const point = this.getClosestPoint(x, y);

    if (typeof hitbox !== 'number' || point.distance < hitbox) {
      return point;
    }

    return null;
  }

  onCanvasMouseMove = (event) => {
    if (
      event.target !== this.canvas &&
      // TODO: Do we need to check mouseDown status?
      !(this.state.isMouseDown && this.state.activePointIndex)
    ) {
      return;
    }

    const { x, y } = getRelativeMouseCoordinates(event, this.canvas);

    // For mobile, we need to capture the movement instead of scrolling
    const { activePointIndex } = this.state;

    if (!this.state.isMouseDown) {
      const point = this.getClosestPointToEvent(event, this.props.pointHitboxMouse);
      this.setState({ activePointIndex: point ? point.index : null });
      return;
    }

    if (typeof activePointIndex === 'number') {
      const { mapX, mapY, mapXIndex, mapYIndex, editable } = params[activePointIndex];

      if (editable) {
        let xMidiValue;
        let yMidiValue;

        // TODO: Ohhh dear...
        {
          const range = (params[activePointIndex].width / paramWidthTotal) * this.getCanvasOffsetWidth();
          const multiplier = (x - this.getPointOffsetX(activePointIndex)) / range;
          xMidiValue = Math.max(
            Math.min(multiplier * this.props.inputMax, this.props.inputMax),
            0
          )
        }
        {
          const multiplier = (y - this.getOffset()) / this.getCanvasOffsetHeight();
          // TODO: Util method for this range limiting:
          yMidiValue = Math.max(
            Math.min(multiplier * this.props.inputMax, this.props.inputMax),
            0
          )
        }

        // TODO: This is terrible

        if (typeof xMidiValue === 'number') {
          this.props.onChange({
            target: {
              name: mapX,
              value: xMidiValue
            }
          })
        }
        if (typeof yMidiValue === 'number') {
          this.props.onChange({
            target: {
              name: mapY,
              value: yMidiValue
            }
          })
        }
      }
    }
  }

  // TODO: yuck
  getPointIndexMap() {
  	return params.map(({ name }) => this[name]);
  }

  componentDidMount() {
    this.ctx = this.canvas.getContext('2d');
    this.events = new EventManager([
      [document, 'mouseup', this.onDocumentMouseUp],
      [document, 'touchend', this.onDocumentMouseUp],
      [document, 'mousemove', this.onCanvasMouseMove],
      [document, 'touchmove', this.onCanvasMouseMove],
      // TODO: This one not great..:
      [window, 'resize', () => {console.log('resize'), this.updateCanvas(this.props, this.state)}],
    ]);

    this.updateCanvas(this.props, this.state);
    this.events.listen();
  }

  componentWillUnmount() {
    this.events.stopListening();
  }

  componentWillUpdate(props, state) {
    this.updateCanvas(props, state);
  }

  onMouseDown = (event) => {
    // TODO: Tidy this. Maybe move param a level deeper, or something to avoid "undefined" ternary result
    const hitbox = event.type === 'touchstart'
      ? this.props.pointHitboxMouse
      : undefined;

    const point = this.getClosestPointToEvent(event, hitbox);

    event.preventDefault();
    this.setState({ isMouseDown: true });

    if (point && point.inputElement) {
      point.inputElement.focus();
    } else if (this.state.focusedInput) {
      this.state.focusedInput.blur();
    }
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
    const activePointIndex = this.getPointIndexMap().indexOf(document.activeElement);
    if (activePointIndex !== -1) {
      this.setState({ activePointIndex })
    }
  }

  onBlur = () => {
    this.setState({ activePointIndex: null })
  }

  render() {
    const { width, height, onChange } = this.props;
    const { isMouseDown } = this.state;

    return (
      <div
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        {params
          .filter(({ hasControls }) => hasControls)
          .map(({ label, name }) => (
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
        {/* TODO: Is duplicating the mouseDown event for touch OK here? */}
        <canvas
          ref={el => this.canvas = el}
          className={classnames(adsrCanvas, {[adsrCanvasGrabbing]: isMouseDown})}
          onMouseDown={this.onMouseDown}
          onTouchStart={this.onMouseDown}
        />
      </div>
    )
  }
}
