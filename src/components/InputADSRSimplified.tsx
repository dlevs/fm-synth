import React, { MouseEvent } from 'react';
import { css } from 'emotion';

interface Props {
	attack: number;
	decay: number;
	sustain: number;
	release: number;
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
}

const Point = ({ x, y }: PointProps) =>
	<circle
		{...sharedProps}
		cx={x}
		cy={y}
		r='1'
		stroke='none'
	/>;

const InputADSRSimplified = ({ attack, decay, sustain, release }: Props) =>
	<svg
		className={styleShadow}
		height='500'
		width='100%'
		viewBox='0 0 100 100'
		onMouseMove={log}
	>
		<path
			{...sharedProps}
			d={`M0 100 L${attack} 0 L${decay} ${sustain} L75 ${sustain} L${release} 100`}
			fill='none'
			strokeWidth='2'
		/>
		<Point x={attack} y={0} />
		<Point x={decay} y={sustain} />
		<Point x={75} y={sustain} />
		<Point x={release} y={100} />
	</svg>;

export default InputADSRSimplified;
