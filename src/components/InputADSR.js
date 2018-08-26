import React, { Component } from 'react';
import classnames from 'classnames';
import sumBy from 'lodash/sumBy';
import upperFirst from 'lodash/upperFirst';
import findIndex from 'lodash/findIndex';
import { css } from 'emotion';
import { findClosestIndex } from 'find-closest';
import { EventManager, getRelativeMouseCoordinates } from '../lib/eventUtils';
import { clearCanvas, drawCircle, resizeCanvas } from '../lib/canvasUtils';
import { visuallyHidden } from '../lib/utilityStyles';

let uniqueIDCounter = 0;
// TODO: make a standard for referencing x, y coordinates. E.g., ALWAYS use an array, or ALWAYS an object. not both

// TODO: Better name?
const getParamMultiplier = (inputs, name) => ({ inputMax, ...params }) => inputs[name].value / inputMax;
// TODO: Rename

class PointConfig {
  constructor({
    name,
    label,
    mapX,
    mapY,
    calculateX,
    calculateY,
    canvasControl = true,
    inputControl = true,
    inputs,
    width = 1,
  }) {
    this.name = name;
    this.label = label || upperFirst(name);

    this.mapX = mapX || name;
    this.mapY = mapY || null;

    // TODO:
    this.calculateX = calculateX || getParamMultiplier(inputs, name);
    this.calculateY = calculateY || null;

    this.canvasControl = canvasControl;
    this.inputControl = inputControl;

    // TODO: Width is a bit confusing. Can it be incorporated into calculateX?
    this.width = width;
    this.inputs = inputs;
  }

  get input() {
    return this.inputs[this.name];
  }
}

const createPointsConfig = (inputs) => [
  {
    name: 'start',
    calculateX: () => 0,
    calculateY: () => 0,
    inputControl: false,
    canvasControl: false,
    width: 0,
  },
  {
    name: 'attack',
    calculateY: () => 1,
  },
  {
    name: 'decay',
    mapY: 'sustain',
    calculateY: getParamMultiplier(inputs, 'sustain'),
  },
  {
    name: 'sustain',
    calculateX: () => 1,
    calculateY: getParamMultiplier(inputs, 'sustain'),
    canvasControl: false,
    width: 0.5,
  },
  {
    name: 'release',
    calculateY: () => 0,
  },
].map(options => new PointConfig({ ...options, inputs }));


const adsrCanvas = css`
  cursor: grab;
  touch-action: none;
  width: 100%;
  display: block;
`;
const adsrCanvasGrabbing = css`
  cursor: grabbing;
`;

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
  static defaultProps = {
    inputMin: 0,
    inputMax: 127,
    pointHitboxMouse: 30,
    pointRadius: 2,
    pointRadiusActive: 4,
    padding: 0,
    width: 'fill',
    height: 200
  }

  state = {
    isMouseDown: false,
    isMouseOver: false,
    focusedInput: null,
    activePointIndex: null
  };

  id = uniqueIDCounter++;

  points = createPointsConfig(this);

  get pointWidthTotal() {
    return sumBy(this.points, 'width');
  }

  get maxPointRadius() {
    const { pointRadius, pointRadiusActive } = this.props;
    return Math.max(pointRadius, pointRadiusActive);
  }

  get offset() {
    return this.maxPointRadius + this.props.padding;
  }

  get canvasOffsetWidth() {
    return this.canvas.width - (2 * this.offset);
  }

  get canvasOffsetHeight() {
    return this.canvas.height - (2 * this.offset);
  }

  getPointOffsetX(i) {
    const point = this.getCurrentCoordinates()[i - 1];
    const rawPointX = point ? point[0] : 0;

    return rawPointX;
  }

  // TODO: Break this class down into smaller helper functions.
  getCurrentCoordinates = () => {
    const { offset, canvasOffsetWidth, canvasOffsetHeight } = this;

    return this.points
      .reduce((points, { name, calculateX, calculateY }, i) => {
        // TODO: Should these calculations with "this.pointWidthTotal" and "params[i].width" be higher up?
        let x = (calculateX(this.props) / this.pointWidthTotal) * this.points[i].width;
        let y = 1 - calculateY(this.props);

        if (i !== 0) {
          const [lastX] = points[i - 1];
          x += lastX;
        }

        return points.concat([[x, y]]);
      }, [])
      // Do we need another loop for this?
      .map(([x, y]) => [
        (x * canvasOffsetWidth) + offset,
        (y * canvasOffsetHeight) + offset
      ]);
  }

  applyUserCanvasContext(step) {
    const { setCanvasContext } = this.props;
    const { activePointIndex, isMouseDown, isMouseOver } = this.state;

    if (setCanvasContext) {
      setCanvasContext(this.ctx, {
        isActive: (activePointIndex && isMouseDown) || isMouseOver,
        step
      });
    }
  }

  updateCanvas = () => {
    const { ctx } = this;
    const { width, height, pointRadiusActive, pointRadius } = this.props;
    const { activePointIndex } = this.state;

    resizeCanvas(ctx, width, height);
    clearCanvas(ctx);

    // TODO: extract to another fn
    const points = this.getCurrentCoordinates();

    ctx.lineJoin = 'bevel';

    this.applyUserCanvasContext('pre-draw-lines');
    ctx.beginPath();
    points.forEach(([x, y], i) => {
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    this.applyUserCanvasContext('pre-draw-points');
    points.forEach(([x, y], i) => {
      const param = this.points[i];
      const radius = i === activePointIndex ? pointRadiusActive : pointRadius;

      if (param && param.canvasControl) {
        drawCircle(ctx, x, y, radius);
      }
    });
  }

  getClosestPoint(x, y) {
    const points = this.getCurrentCoordinates();
    const distances = points.map(([x2, y2]) => Math.abs(x - x2) + Math.abs(y - y2));
    const index = findClosestIndex(distances, 0);

    // TODO: Hitbox as param in this fn, to avoid needing to leak distance out of this fn
    return {
      distance: distances[index],
      point: points[index],
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
    const { canvas } = this;
    const { pointHitboxMouse, inputMax, onChange } = this.props;
    const { isMouseDown, activePointIndex } = this.state;
    const { x, y } = getRelativeMouseCoordinates(event, canvas);

    if (
      event.target !== canvas &&
      // TODO: Do we need to check mouseDown status?
      !(isMouseDown && activePointIndex)
    ) {
      return;
    }

    if (!isMouseDown) {
      const point = this.getClosestPointToEvent(event, pointHitboxMouse);
      this.setState({ activePointIndex: point ? point.index : null });
      return;
    }

    if (typeof activePointIndex === 'number') {
      const { mapX, mapY, canvasControl } = this.points[activePointIndex];

      if (canvasControl) {
        let xMidiValue;
        let yMidiValue;

        // TODO: Ohhh dear...
        {
          const range = (this.points[activePointIndex].width / this.pointWidthTotal) * this.canvasOffsetWidth;
          const multiplier = (x - this.getPointOffsetX(activePointIndex)) / range;
          xMidiValue = Math.max(
            Math.min(multiplier * inputMax, inputMax),
            0
          )
        }
        {
          const multiplier = (y - this.offset) / this.canvasOffsetHeight;
          // TODO: Util method for this range limiting:
          yMidiValue = inputMax - Math.max(
            Math.min(multiplier * inputMax, inputMax),
            0
          )
        }

        // TODO: Don't pass pseudo event. Make consistent
        if (typeof xMidiValue === 'number') {
          onChange({
            target: {
              name: mapX,
              value: xMidiValue
            }
          })
        }
        if (typeof yMidiValue === 'number') {
          onChange({
            target: {
              name: mapY,
              value: yMidiValue
            }
          })
        }
      }
    }
  }

  componentDidMount() {
    this.ctx = this.canvas.getContext('2d');
    this.events = new EventManager([
      [document, 'mouseup', this.onDocumentMouseUp],
      [document, 'touchend', this.onDocumentMouseUp],
      [document, 'mousemove', this.onCanvasMouseMove],
      [document, 'touchmove', this.onCanvasMouseMove],
      [window, 'resize', this.updateCanvas],
    ]);
    this.updateCanvas();
    this.events.listen();
  }

  componentWillUnmount() {
    this.events.stopListening();
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  onMouseDown = (event) => {
    const { pointHitboxMouse } = this.props;
    const { focusedInput } = this.state;
    // TODO: Tidy this. Maybe move param a level deeper, or something to avoid "undefined" ternary result
    const hitbox = event.type === 'touchstart' ? pointHitboxMouse : undefined;
    const point = this.getClosestPointToEvent(event, hitbox);
    // TODO: tidy:
    const pointConfig = point && this.points[point.index];

    event.preventDefault();
    this.setState({ isMouseDown: true });

    if (pointConfig.input) {
      pointConfig.input.focus();
    } else if (focusedInput) {
      focusedInput.blur();
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
    const activePointIndex = findIndex(this.points, { input: document.activeElement });
    if (activePointIndex !== -1) {
      this.setState({ activePointIndex })
    }
  }

  onBlur = () => {
    this.setState({ activePointIndex: null })
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
        {this.points
          .filter(({ inputControl }) => inputControl)
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
