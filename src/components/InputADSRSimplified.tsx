import React, { MouseEvent } from 'react';
import { css } from 'emotion';

interface Props {
	attack: number;
	decay: number;
	sustain: number;
	release: number;
	onChange(changes: [string, number][]): void;
}

interface PointProps {
	x: number;
	y: number;
}

const styleWrapper = css`
	padding: 12px;
`;

const styleSvg = css`
	overflow: visible;
	filter: drop-shadow(0 0 5px #000);

	&:hover {
		path {
			fill: rgba(0, 0, 0, 0.05);
		}
	}
`;

const styleSvgBase = css`
	vector-effect: non-scaling-stroke;
	stroke-width: 1;
	stroke: #444;
	fill: none;
`;

const styleHitbox = css`
	${styleSvgBase}
	stroke: transparent;
	z-index: 1;
	position: relative;
	stroke-width: 50;
	cursor: grab;
`;

const styleCircle = css`
	${styleSvgBase}
	pointer-events: none;
	stroke-width: 6;

	.${styleHitbox}:hover + & {
		stroke-width: 12;
	}
`;

const log = ({ target }: MouseEvent) => {
	console.log(target);
};

// const onMouseMove = () => {
// 	if (!this.canvas.current) {
// 		return;
// 	}

// 	const { pointHitboxMouse, inputMax, onChange, isMouseDown } = this.props;
// 	const { activePointIndex } = this.state;
// 	const { x, y } = getRelativeMouseCoordinates(event, this.canvas.current);

// 	if (
// 		event.target !== this.canvas.current &&
// 		// TODO: Do we need to check mouseDown status?
// 		!(isMouseDown && activePointIndex)
// 	) {
// 		return;
// 	}

// 	if (!isMouseDown) {
// 		const point = this.getClosestPointToEvent(event, pointHitboxMouse);
// 		this.setState({ activePointIndex: point ? point.index : null });
// 		return;
// 	}

// 	if (typeof activePointIndex !== 'number') {
// 		return;
// 	}

// 	const { mapX, mapY, canvasControl } = this.points[activePointIndex];

// 	if (!canvasControl) {
// 		return;
// 	}

// 	// TODO: Make some generic top-level types maybe? Like Array<[string, number]> to reuse
// 	const changes: [string, number][] = [];
// 	if (mapX) {
// 		const range = (this.points[activePointIndex].width / this.pointWidthTotal) * this.canvasOffsetWidth;
// 		const multiplier = (x - this.getPointOffsetX(activePointIndex)) / range;
// 		const xMidiValue = this.clampValue(multiplier * inputMax);
// 		changes.push([mapX, xMidiValue]);
// 	}
// 	if (mapY) {
// 		const multiplier = (y - this.offset) / this.canvasOffsetHeight;
// 		const yMidiValue = inputMax - this.clampValue(multiplier * inputMax);
// 		changes.push([mapY, yMidiValue]);
// 	}
// 	if (changes.length) {
// 		onChange(changes);
// 	}
// }

/**
 * Render a circle. To be used inside of an <svg> element.
 *
 * Uses the <line> element instead of <circle> in order to make use of
 * non-scaling-stroke, so the SVG can be scaled without increasing the
 * size of the circle.
 */
const Point = ({ x, y }: PointProps) =>
	<>
		<line
			className={styleHitbox}
			x1={x}
			y1={y}
			x2={x}
			y2={y}
			strokeLinecap='round'
			onMouseEnter={log}
		/>
		<line
			className={styleCircle}
			x1={x}
			y1={y}
			x2={x}
			y2={y}
			strokeLinecap='round'
		/>
	</>;

const InputADSRSimplified = ({ attack, decay, sustain, release }: Props) => {
	const xDecay = attack + decay;
	const xSustain = xDecay + 25;
	const xRelease = xSustain + release;

	return (
		<div className={styleWrapper}>
			<svg
				className={styleSvg}
				height='500'
				width='100%'
				viewBox='0 0 100 100'
			>
				<path className={styleSvgBase} d={`M0 100 L${attack} 0 L${xDecay} ${sustain} L${xSustain} ${sustain} L${xRelease} 100`} />
				<Point x={attack} y={0} />
				<Point x={xDecay} y={sustain} />
				<Point x={xSustain} y={sustain} />
				<Point x={xRelease} y={100} />
			</svg>
		</div>
	);
};

export default InputADSRSimplified;
