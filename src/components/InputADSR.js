import React, { Component } from 'react';
import classnames from 'classnames';
import sumBy from 'lodash/sumBy';
import upperFirst from 'lodash/upperFirst';
import { css } from 'emotion';
import { findClosestIndex } from 'find-closest';
import { EventManager, getRelativeMouseCoordinates } from '../lib/eventUtils';
import { clearCanvas, drawCircle, resizeCanvas } from '../lib/canvasUtils';
import { visuallyHidden } from '../lib/utilityStyles';

let uniqueIDCounter = 0;
// TODO: make a standard for referencing x, y coordinates. E.g., ALWAYS use an array, or ALWAYS an object. not both

// TODO: Better name?
const getParamMultiplier = name =>
  ({ inputMax, ...params }) => params[name] / inputMax;

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

  return {
    label: upperFirst(param.name),
    mapX,
    calculateX: getParamMultiplier(param.name),
    // TODO: Hmmm
    getInput: instance => instance[param.name] || null,
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

  getMaxPointRadius() {
    const { pointRadius, pointRadiusActive } = this.props;
    return Math.max(pointRadius, pointRadiusActive);
  }

  getOffset() {
    const { padding } = this.props;
    return this.getMaxPointRadius() + padding;
  }

  getPointOffsetX(i) {
    const point = this.getCurrentCoordinates()[i - 1];
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
  getCurrentCoordinates = () => {
    const offset = this.getOffset();
    const width = this.getCanvasOffsetWidth();
    const height = this.getCanvasOffsetHeight();

    // TODO: Maybe use a single loop here, or reduce
    return params
      .reduce((points, { name, calculateX, calculateY }, i) => {
        // TODO: Should these calculations with "paramWidthTotal" and "params[i].width" be higher up?
        let x = (calculateX(this.props) / paramWidthTotal) * params[i].width;
        let y = calculateY(this.props);

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
      const param = params[i];
      const radius = i === activePointIndex ? pointRadiusActive : pointRadius;

      if (param && param.editable) {
        drawCircle(ctx, x, y, radius);
      }
    });
  }

  // TODO: be consistent with parameter naming "index" vs "i"
  getPoint(index) {
    // TODO: Be consistent with naming "point" vs "coordinate"
    return this.getCurrentCoordinates()[index];
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
      const { mapX, mapY, editable } = params[activePointIndex];

      if (editable) {
        let xMidiValue;
        let yMidiValue;

        // TODO: Ohhh dear...
        {
          const range = (params[activePointIndex].width / paramWidthTotal) * this.getCanvasOffsetWidth();
          const multiplier = (x - this.getPointOffsetX(activePointIndex)) / range;
          xMidiValue = Math.max(
            Math.min(multiplier * inputMax, inputMax),
            0
          )
        }
        {
          const multiplier = (y - this.getOffset()) / this.getCanvasOffsetHeight();
          // TODO: Util method for this range limiting:
          yMidiValue = Math.max(
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
    const input = point && params[point.index] && params[point.index].getInput(this);

    event.preventDefault();
    this.setState({ isMouseDown: true });

    if (input) {
      input.focus();
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
    const activePointIndex = params.findIndex(({ getInput }) => {
      return getInput(this) === document.activeElement;
    });
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
