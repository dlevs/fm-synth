import { css, cx } from 'emotion';
import findIndex from 'lodash/findIndex';
import clamp from 'lodash/clamp';
import sumBy from 'lodash/sumBy';
import upperFirst from 'lodash/upperFirst';
import React, { ChangeEvent, Component, createRef, MouseEvent, RefObject, TouchEvent } from 'react';
import { defaultProps } from 'recompose';
import { clearCanvas, drawCircle, resizeCanvas } from '../lib/canvasUtils';
import { EventManager, getRelativeMouseCoordinates } from '../lib/eventUtils';
import { Omit } from '../lib/types';
import { visuallyHidden } from '../lib/utilityStyles';
import InputRange from './InputRange';
import MouseDownStatus from './util/MouseDownStatus';
import MouseOverStatus from './util/MouseOverStatus';

// TODO: This widget can probably be made much simpler with SVG than canvas. Try SVG for future widgets + consider refactoring

// TODO: Move me, and use everywhere where points are used
type Point = [number, number];

// TODO: Better name?
const getParamMultiplier = (inputs: Inputs, name: ParamName) =>
	({ inputMax }: Props) => {
		// TODO: Do we really need this level of paranoia to use TS?
		const inputElem = inputs[name] && inputs[name].current;
		if (inputElem) {
			return Number(inputElem.value) / inputMax;
		}
		return 0;
	};
// TODO: Rename

type pointCalculation = (options: Props) => number;

type ParamName = 'attack' | 'decay' | 'sustain' | 'release';

interface Inputs {
	attack: RefObject<HTMLInputElement>;
	decay: RefObject<HTMLInputElement>;
	release: RefObject<HTMLInputElement>;
	sustain: RefObject<HTMLInputElement>;
}

// TODO: This class feels unnecessary. Simplify with simple function to expand
class PointConfig {
	public name: ParamName;
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
	}: Partial<PointConfig> & { name: ParamName; inputs: Inputs; calculateY: pointCalculation }) {
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

const createPointsConfig = (inputs: Inputs): PointConfig[] => [
	{
		calculateX: () => 0,
		calculateY: () => 0,
		canvasControl: false,
		inputControl: false,
		// TODO: "start" is not in ParamName...
		name: 'start' as ParamName,
		width: 0,
	},
	{
		calculateY: () => 1,
		// TODO: Hmmm...
		name: 'attack' as ParamName,
	},
	{
		calculateY: getParamMultiplier(inputs, 'sustain'),
		mapY: 'sustain',
		name: 'decay' as ParamName,
	},
	{
		calculateX: () => 1,
		calculateY: getParamMultiplier(inputs, 'sustain'),
		canvasControl: false,
		name: 'sustain' as ParamName,
		width: 0.5,
	},
	{
		calculateY: () => 0,
		name: 'release' as ParamName,
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

type CtxRenderingStep = 'pre-draw-lines' | 'pre-draw-points';

type Dimension = number | 'fill';
class DefaultProps {
	public height: Dimension = 200;
	public inputMax = 127;
	public inputMin = 0;
	public padding = 0;
	public pointHitboxMouse = 30;
	public pointRadius = 2;
	public pointRadiusActive = 4;
	public width: Dimension = 'fill';
}

interface Props extends DefaultProps {
	isMouseDown: boolean;
	isMouseOver: boolean;
	onChange(changes: [string, number][]): void;
	// TODO: export this and use in App.js when defining this callback
	setCanvasContext?(
		ctx: CanvasRenderingContext2D,
		{}: { step: CtxRenderingStep; isActive: boolean },
	): void;
}

class State {
	public activePointIndex: number | null = null;
}

class InputADSRBase extends Component<Props, State> {
	// --------------------------------------------
	// Class instance properties
	// --------------------------------------------
	public state = new State();
	// TODO: Can these be private?
	public attack: RefObject<HTMLInputElement> = createRef();
	public decay: RefObject<HTMLInputElement> = createRef();
	public release: RefObject<HTMLInputElement> = createRef();
	public sustain: RefObject<HTMLInputElement> = createRef();
	public canvas: RefObject<HTMLCanvasElement> = createRef();
	public events: EventManager;
	public ctx: CanvasRenderingContext2D | null = null;
	private readonly points = createPointsConfig(this as Inputs);

	// --------------------------------------------
	// Lifecycle methods
	// --------------------------------------------
	public componentDidMount() {
		// TODO: Is there a better way for this?
		if (this.canvas && this.canvas.current) {
			this.ctx = this.canvas.current.getContext('2d');
		}
		this.events = new EventManager(() => [
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
			>
				<div className={visuallyHidden}>
					{this.points
						.filter(({ inputControl }) => inputControl)
						.map(({ label, name }: Pick<PointConfig, 'name' | 'label'>) => (
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
					className={cx(adsrCanvas, { [adsrCanvasGrabbing]: isMouseDown })}
					onMouseDown={this.onMouseDown}
					onTouchStart={this.onMouseDown}
				/>
			</div>
		);
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
		if (this.canvas.current) {
			return this.canvas.current.width - (this.offset * 2);
		}

		return 0;
	}

	private get canvasOffsetHeight(): number {
		if (this.canvas.current) {
			return this.canvas.current.height - (this.offset * 2);
		}

		return 0;
	}

	// TODO: Break this class down into smaller helper functions.
	private get currentCoordinates() {
		return this.points
			.reduce((points: Point[], { calculateX, calculateY }, i) => {
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
				(x * this.canvasOffsetWidth) + this.offset,
				(y * this.canvasOffsetHeight) + this.offset,
			]);
	}

	private getPointOffsetX(i: number) {
		const point = this.currentCoordinates[i - 1];
		return point ? point[0] : 0;
	}

	private getClosestPoint(x: number, y: number) {
		const points = this.currentCoordinates;
		const distances = points.map(([x2, y2]) => Math.abs(x - x2) + Math.abs(y - y2));
		const index = distances.indexOf(Math.min(...distances));

		// TODO: Hitbox as param in this fn, to avoid needing to leak distance out of this fn
		return {
			distance: distances[index],
			index,
			point: points[index],
		};
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
	private readonly updateCanvas = () => {
		// tslint:disable-next-line:no-this-assignment
		const { ctx } = this;
		const { width, height, pointRadiusActive, pointRadius } = this.props;
		const { activePointIndex } = this.state;

		if (!ctx) {
			return;
		}

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
	};

	private applyUserCanvasContext(step: CtxRenderingStep) {
		const { setCanvasContext, isMouseDown, isMouseOver } = this.props;
		const { activePointIndex } = this.state;

		if (!this.ctx || !setCanvasContext) {
			return;
		}

		setCanvasContext(this.ctx, {
			isActive: (activePointIndex && isMouseDown) || isMouseOver,
			step,
		});
	}

	private clampValue(value: number) {
		const { inputMin, inputMax } = this.props;
		return clamp(value, inputMin, inputMax);
	}

	private readonly handleChangeEvent = ({ target }: ChangeEvent<HTMLInputElement>) => {
		// TODO: Do I really need all this?
		if (!(target && target instanceof HTMLInputElement)) {
			return;
		}

		this.props.onChange([
			[target.name, Number(target.value)],
		]);
	};

	// --------------------------------------------
	// Event listener callbacks
	// --------------------------------------------
	private readonly onFocus = () => {
		const activePointIndex = findIndex(this.points, ['input.current', document.activeElement]);
		if (activePointIndex !== -1) {
			this.setState({ activePointIndex });
		}
	};

	private readonly onBlur = () => {
		this.setState({ activePointIndex: null });
	};

	private readonly onMouseDown = (event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
		const { pointHitboxMouse } = this.props;
		// TODO: Tidy this. Maybe move param a level deeper, or something to avoid "undefined" ternary result
		const hitbox = event.type === 'touchstart' ? pointHitboxMouse : undefined;
		const point = this.getClosestPointToEvent(event, hitbox);
		// TODO: tidy:
		const pointConfig = point && this.points[point.index];

		event.preventDefault();

		if (pointConfig && pointConfig.input && pointConfig.input.current) {
			pointConfig.input.current.focus();
		}
	};

	private readonly onMouseMove = (event: MouseEvent | TouchEvent) => {
		if (!this.canvas.current) {
			return;
		}

		const { pointHitboxMouse, inputMax, onChange, isMouseDown } = this.props;
		const { activePointIndex } = this.state;
		const { x, y } = getRelativeMouseCoordinates(event, this.canvas.current);

		if (
			event.target !== this.canvas.current &&
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

		if (typeof activePointIndex !== 'number') {
			return;
		}

		const { mapX, mapY, canvasControl } = this.points[activePointIndex];

		if (!canvasControl) {
			return;
		}

		// TODO: Make some generic top-level types maybe? Like Array<[string, number]> to reuse
		const changes: [string, number][] = [];
		if (mapX) {
			const range = (this.points[activePointIndex].width / this.pointWidthTotal) * this.canvasOffsetWidth;
			const multiplier = (x - this.getPointOffsetX(activePointIndex)) / range;
			const xMidiValue = this.clampValue(multiplier * inputMax);
			changes.push([mapX, xMidiValue]);
		}
		if (mapY) {
			const multiplier = (y - this.offset) / this.canvasOffsetHeight;
			const yMidiValue = inputMax - this.clampValue(multiplier * inputMax);
			changes.push([mapY, yMidiValue]);
		}
		if (changes.length) {
			onChange(changes);
		}
	};
}

// --------------------------------------------
// Wrap and export
// --------------------------------------------
const withDefaultProps = defaultProps(new DefaultProps());
const InputADSR = (props: Omit<Props, 'isMouseDown' | 'isMouseOver'>) =>
	<MouseDownStatus>{({ isMouseDown }) =>
		<MouseOverStatus>{({ isMouseOver }) =>
			<InputADSRBase
				{...props}
				isMouseDown={isMouseDown}
				isMouseOver={isMouseOver}
			/>
		}</MouseOverStatus>
	}</MouseDownStatus>;

export default withDefaultProps(InputADSR);
