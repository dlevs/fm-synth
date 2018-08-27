import classnames from 'classnames';
import { css } from 'emotion';
import { findClosestIndex } from 'find-closest';
import findIndex from 'lodash/findIndex';
import sumBy from 'lodash/sumBy';
import upperFirst from 'lodash/upperFirst';
import React, { Component, Ref, ComponentType, ComponentClass, createRef } from 'react';
import { clearCanvas, drawCircle, resizeCanvas } from '../lib/canvasUtils';
import { EventManager, getRelativeMouseCoordinates } from '../lib/eventUtils';
import { visuallyHidden } from '../lib/utilityStyles';
import withMouseDownTracking from './higherOrder/withMouseDownTracking';
import withMouseOverTracking from './higherOrder/withMouseOverTracking';
import InputRange from './InputRange';

// TODO: make a standard for referencing x, y coordinates. E.g., ALWAYS use an array, or ALWAYS an object. not both

// TODO: Better name?
const getParamMultiplier = (inputs: Inputs, name: string) =>
  ({ inputMax }: Props) => inputs[name].value / inputMax;
// TODO: Rename

type pointCalculation = (options: Props) => number;
interface Inputs {
  attack: Ref<HTMLInputElement>;
  decay: Ref<HTMLInputElement>;
  release: Ref<HTMLInputElement>;
  sustain: Ref<HTMLInputElement>;
}

// TODO: Consider putting the rule of 1 class per file back in tslint
// TODO: wtf is this class...
class PointConfig {
  public name: string;
  public label: string;
  public mapX: string;
  public mapY: string | null;
  public calculateX: pointCalculation;
  public calculateY: pointCalculation;
  public canvasControl: boolean;
  public inputControl: boolean;
  public inputs: Inputs;
  public width: number;

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
    // TODO: Better way to do this Partial? :
  }: Partial<PointConfig> & { name: string, inputs: Inputs, calculateY: pointCalculation }) {
    this.name = name;
    this.label = label || upperFirst(name);

    this.mapX = mapX || name;
    this.mapY = mapY || null;

    // TODO:
    this.calculateX = calculateX || getParamMultiplier(inputs, name);
    this.calculateY = calculateY;

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

const createPointsConfig = (inputs: Inputs) => [
  {
    calculateX: () => 0,
    calculateY: () => 0,
    canvasControl: false,
    inputControl: false,
    name: 'start',
    width: 0,
  },
  {
    calculateY: () => 1,
    name: 'attack',
  },
  {
    calculateY: getParamMultiplier(inputs, 'sustain'),
    mapY: 'sustain',
    name: 'decay',
  },
  {
    calculateX: () => 1,
    calculateY: getParamMultiplier(inputs, 'sustain'),
    canvasControl: false,
    name: 'sustain',
    width: 0.5,
  },
  {
    calculateY: () => 0,
    name: 'release',
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

export interface Props {
  inputMin: number
  inputMax: number
  pointHitboxMouse: number
  pointRadius: number
  pointRadiusActive: number
  padding: number
  width: number | 'fill'
  height: number | 'fill'
  onChange: (changes: [[string, number]]) => void
}
export class State {
  public activePointIndex: number | null = null;
  public focusedInput: HTMLInputElement | null = null;
}

class InputADSR extends Component<Props, State> {
  // --------------------------------------------
  // Static properties
  // --------------------------------------------
  public static defaultProps: Partial<Props> = {
    height: 200,
    inputMax: 127,
    inputMin: 0,
    padding: 0,
    pointHitboxMouse: 30,
    pointRadius: 2,
    pointRadiusActive: 4,
    width: 'fill',
  }

  // --------------------------------------------
  // Class instance properties
  // --------------------------------------------
  public state = new State();
  // TODO: Can these be private?
  public attack = createRef();
  public decay = createRef();
  public release = createRef();
  public sustain = createRef();
  public canvas = createRef();

  private points = createPointsConfig(this as Inputs);

  // --------------------------------------------
  // Lifecycle methods
  // --------------------------------------------
  public componentDidMount() {
    this.ctx = this.canvas.getContext('2d');
    this.events = new EventManager([
      [document, 'mousemove', this.onMouseMove],
      [document, 'touchmove', this.onMouseMove],
      [window, 'resize', this.updateCanvas],
    ]);
    this.updateCanvas();
    this.events.listen();
  }

  public componentWillUnmount() {
    this.events.stopListening();
  }

  public componentDidUpdate() {
    this.updateCanvas();
  }

  public render() {
    const { isMouseDown, inputMin, inputMax } = this.props;

    return (
      <div
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <div className={visuallyHidden}>
          {this.points
            .filter(({ inputControl }) => inputControl)
            .map(({ label, name }) => (
              <InputRange
                label={label}
                key={name}
                name={name}
                min={inputMin}
                max={inputMax}
                value={this.props[name]}
                onChange={this.handleChangeEvent}
                inputRef={this[name]}
              />
            ))}
        </div>
        <canvas
          ref={this.canvas}
          className={classnames(adsrCanvas, {[adsrCanvasGrabbing]: isMouseDown})}
          onMouseDown={this.onMouseDown}
          onTouchStart={this.onMouseDown}
        />
      </div>
    )
  }

  // --------------------------------------------
  // Getter methods
  // --------------------------------------------
  private get pointWidthTotal() {
    return sumBy(this.points, 'width');
  }

  private get maxPointRadius() {
    const { pointRadius, pointRadiusActive } = this.props;
    return Math.max(pointRadius, pointRadiusActive);
  }

  private get offset() {
    return this.maxPointRadius + this.props.padding;
  }

  private get canvasOffsetWidth(): number {
    const { canvas, offset } = this;

    if (canvas instanceof HTMLCanvasElement) {
      return canvas.width - (2 * offset);
    }

    return 0;
  }

  private get canvasOffsetHeight(): number {
    const { canvas, offset } = this;

    if (canvas instanceof HTMLCanvasElement) {
      return canvas.height - (2 * offset);
    }

    return 0;
  }

  // TODO: Break this class down into smaller helper functions.
  private get currentCoordinates() {
    const { offset, canvasOffsetWidth, canvasOffsetHeight } = this;

    return this.points
      .reduce((points: [[number, number]], { calculateX, calculateY }, i) => {
        // TODO: Should these calculations with "this.pointWidthTotal" and "params[i].width" be higher up?
        let x = (calculateX(this.props) / this.pointWidthTotal) * this.points[i].width;
        const y = 1 - calculateY(this.props);

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

  private getPointOffsetX(i: number) {
    const point = this.currentCoordinates[i - 1];
    const rawPointX = point ? point[0] : 0;

    return rawPointX;
  }

  private getClosestPoint(x: number, y: number) {
    const points = this.currentCoordinates;
    const distances = points.map(([x2, y2]) => Math.abs(x - x2) + Math.abs(y - y2));
    const index = findClosestIndex(distances, 0);

    // TODO: Hitbox as param in this fn, to avoid needing to leak distance out of this fn
    return {
      distance: distances[index],
      index,
      point: points[index],
    }
  }

  // TODO: hitbox param should be a level above
  private getClosestPointToEvent(event: MouseEvent | TouchEvent, hitbox?: number) {
    const { x, y } = getRelativeMouseCoordinates(event);
    const point = this.getClosestPoint(x, y);

    if (typeof hitbox !== 'number' || point.distance < hitbox) {
      return point;
    }

    return null;
  }

  // --------------------------------------------
  // Methods
  // --------------------------------------------
  private updateCanvas = () => {
    const { ctx } = this;
    const { width, height, pointRadiusActive, pointRadius } = this.props;
    const { activePointIndex } = this.state;

    resizeCanvas(ctx, width, height);
    clearCanvas(ctx);

    // TODO: extract to another fn
    const points = this.currentCoordinates;

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

  private applyUserCanvasContext(step) {
    const { setCanvasContext, isMouseDown, isMouseOver } = this.props;
    const { activePointIndex } = this.state;

    if (setCanvasContext) {
      setCanvasContext(this.ctx, {
        isActive: (activePointIndex && isMouseDown) || isMouseOver,
        step
      });
    }
  }

  private handleChangeEvent = ({ target }) => {
    this.props.onChange([
      [target.name, target.value]
    ]);
  }

  // --------------------------------------------
  // Event listener callbacks
  // --------------------------------------------
  private onFocus = () => {
    const activePointIndex = findIndex(this.points, {
      input: document.activeElement
    });
    if (activePointIndex !== -1) {
      this.setState({ activePointIndex })
    }
  }

  private onBlur = () => {
    this.setState({ activePointIndex: null })
  }

  private onMouseDown = (event) => {
    const { pointHitboxMouse } = this.props;
    const { focusedInput } = this.state;
    // TODO: Tidy this. Maybe move param a level deeper, or something to avoid "undefined" ternary result
    const hitbox = event.type === 'touchstart' ? pointHitboxMouse : undefined;
    const point = this.getClosestPointToEvent(event, hitbox);
    // TODO: tidy:
    const pointConfig = point && this.points[point.index];

    event.preventDefault();

    if (pointConfig.input) {
      pointConfig.input.focus();
    } else if (focusedInput) {
      focusedInput.blur();
    }
  }

  private onMouseMove = (event: MouseEvent | TouchEvent) => {
    const { canvas } = this;

    if (!(canvas instanceof HTMLElement)) {
      return;
    }

    const { pointHitboxMouse, inputMax, onChange, isMouseDown } = this.props;
    const { activePointIndex } = this.state;
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

        const changes = [];
        if (mapX) {
          changes.push([mapX, xMidiValue]);
        }
        if (mapY) {
          changes.push([mapY, yMidiValue]);
        }
        if (changes.length) {
          onChange(changes);
        }
      }
    }
  }
}

export default withMouseDownTracking(withMouseOverTracking(InputADSR));
export const foo = withMouseDownTracking(withMouseOverTracking(() => <div>foo</div>));
