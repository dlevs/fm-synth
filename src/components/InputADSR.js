import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import sumBy from 'lodash/sumBy';
import upperFirst from 'lodash/upperFirst';
import { css } from 'emotion';
import { findClosestIndex } from 'find-closest';
import { clearCanvas, drawCircle } from '../lib/canvasUtils';

let uniqueIDCounter = 0;
// TODO: make a standard for referencing x, y coordinates. E.g., ALWAYS use an array, or ALWAYS an object. not both

const calculateSustainY = ({ canvas, sustain, inputMax, offset }) => {
  const heightStep = (canvas.height - (2 * offset)) / inputMax;
  return canvas.height - (sustain * heightStep) - offset;
}
const calculateBottomY = ({ canvas, offset }) => canvas.height - offset;
const calculateXForParam = ({ canvas, value, inputMax, i, offset }) => {
  // TODO: passing all this to getPointRangeX is silly
  return (value / inputMax) * getPointRangeX(canvas, i, offset);
}
const calculateMaxXForParam =  args => calculateXForParam({...args, value: args.inputMax});
const getOffsetCanvasWidth = (canvas, offset) => {
  return canvas.width - (2 * offset)
}
// TODO: These are grim. Tidy.
const getPointRangeX = (canvas, i, offset) => {
  return (params[i].width / paramWidthTotal) * getOffsetCanvasWidth(canvas, offset);
}

// TODO: Rename
const params = [
  {
    name: 'start',
    hasControls: false,
    editable: false,
    width: 0,
    calculateX: ({ offset }) => offset,
    calculateY: calculateBottomY,
  },
  {
    name: 'attack',
    calculateY: ({ offset }) => offset,
  },
  {
    name: 'decay',
    mapY: 'sustain',
    calculateY: calculateSustainY,
  },
  {
    name: 'sustain',
    mapY: 'sustain',
    calculateX: calculateMaxXForParam,
    calculateY: calculateSustainY,
    mapX: null,
    width: 0.5,
    editable: false
  },
  {
    name: 'release',
    calculateY: calculateBottomY,
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
    calculateX: calculateXForParam,
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
`;
const adsrCanvasGrabbing = css`
  cursor: grabbing;
`;


// TODO: Move to util file
const getRelativeMouseCoordinates = (event, element) => {
  const bounds = (element || event.target).getBoundingClientRect();

  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top
  };
}

const ADSRInputField = ({ id, label, inputRef, inputMin, inputMax, ...otherProps }) => (
  <Fragment>
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
  </Fragment>
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

    return Math.max(rawPointX, this.getOffset());
  }

  // TODO: Break this class down into smaller helper functions.

  getCurrentCoordinates = (props) => {
    // TODO: Maybe use a single loop here, or reduce
    return params.reduce((points, { name, calculateX, calculateY }, i) => {
      const calculationParams = {
        ...props,
        value: props[name],
        canvas: this.canvas,
        i,
        offset: this.getOffset(props)
      };
      let x = calculateX(calculationParams);
      let y = calculateY(calculationParams);

      if (i !== 0) {
        const [lastX] = points[i - 1];
        x += lastX;
      }

      return points.concat([[x, y]]);
    }, []);
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
    // TODO: extract to another fn
    const points = this.getCurrentCoordinates(props);
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
      !(this.state.isMouseDown && this.state.activePointIndex)
    ) {
      return;
    }

    // TODO: Both these call `getRelativeMouseCoordinates`. Prevent duplication.
    const { x, y } = getRelativeMouseCoordinates(event, this.canvas);

    if (!this.state.isMouseDown) {
      const point = this.getClosestPointToEvent(event, this.props.pointHitboxMouse);
      this.setState({ activePointIndex: point ? point.index : null });
      return;
    }

    const { activePointIndex } = this.state;

    if (typeof activePointIndex === 'number') {
      const { mapX, mapY, mapXIndex, mapYIndex, editable } = params[activePointIndex];

      if (editable) {
        let xMidiValue;
        let yMidiValue;

        // TODO: Ohhh dear...
        {
          const range = getPointRangeX(this.canvas, activePointIndex, this.getOffset());
          const offset = this.getPointOffsetX(activePointIndex);

          const multiplier = (x - offset) / range;
          // TODO: Util method for this range limiting:
          xMidiValue = Math.max(
            Math.min(multiplier * this.props.inputMax, this.props.inputMax),
            0
          )
        }
        {
          const range = this.canvas.height - (2 * this.getOffset());
          const multiplier = 1 - ((y - this.getOffset()) / range);
          // TODO: Util method for this range limiting:
          yMidiValue = Math.max(
            Math.min(multiplier * this.props.inputMax, this.props.inputMax),
            0
          )
        }

        // TODO: This is terrible

        if (mapX) {
          this.props.onChange({
            target: {
              name: mapX,
              value: xMidiValue
            }
          })
        }
        if (mapY) {
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
    this.updateCanvas(this.props, this.state);
    document.addEventListener('mouseup', this.onDocumentMouseUp)
    document.addEventListener('mousemove', this.onCanvasMouseMove)
  }

  componentWillUnmount() {
    // TODO: Look for an npm package that will handle event definition + teardown do reduce this duplication
    document.removeEventListener('mouseup', this.onDocumentMouseUp)
    document.removeEventListener('mousemove', this.onCanvasMouseMove)
  }

  componentWillUpdate(props, state) {
    this.updateCanvas(props, state);
  }

  onMouseDown = (event) => {
    const point = this.getClosestPointToEvent(event, this.props.pointHitboxMouse);

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
        <canvas
          ref={el => this.canvas = el}
          width="500"
          height="200"
          className={classnames(adsrCanvas, {[adsrCanvasGrabbing]: isMouseDown})}
          onMouseDown={this.onMouseDown}
        />
      </div>
    )
  }
}
