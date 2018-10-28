import React, { MouseEvent } from 'react';
import { css } from 'emotion';

interface Props {
	attack: number;
	decay: number;
	sustain: number;
	release: number;
	onChange(changes: [string, number][]): void;
}

const styleShadow = css`
	filter: drop-shadow(0 0 5px #000);
`;

const sharedProps = {
	vectorEffect: 'non-scaling-stroke',
	strokeWidth: 0,
	stroke: '#444',
	fill: '#444',
};

const log = ({ target }: MouseEvent) => {
	console.log(target);
};

interface PointProps {
	x: number;
	y: number;
	size: number;
}

/**
 * Render a circle. To be used inside of an <svg> element.
 *
 * Uses the <line> element instead of <circle> in order to make use of
 * non-scaling-stroke, so the SVG can be scaled without increasing the
 * size of the circle.
 */
const Point = ({ x, y, size }: PointProps) =>
	<line
		{...sharedProps}
		x1={x}
		y1={y}
		x2={x}
		y2={y}
		strokeLinecap='round'
		strokeWidth={size}
		onMouseEnter={log}
	/>;

const InputADSRSimplified = ({ attack, decay, sustain, release }: Props) => {
	return (
		<svg
			className={styleShadow}
			height='500'
			width='100%'
			viewBox='0 0 100 100'
		>
			<path
				{...sharedProps}
				d={`M0 100 L${attack} 0 L${decay} ${sustain} L75 ${sustain} L${release} 100`}
				fill='none'
				strokeWidth='1'
			/>
			<Point size={6} x={attack} y={0} />
			<Point size={6} x={decay} y={sustain} />
			<Point size={6} x={75} y={sustain} />
			<Point size={6} x={release} y={100} />
		</svg>
	);
};

export default InputADSRSimplified;
