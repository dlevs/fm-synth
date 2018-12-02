import React, { HTMLAttributes } from 'react';
import { Point } from '../lib/types';

interface Props extends HTMLAttributes<SVGPathElement> {
	points: Point[];
}

const SVGPathLine = ({ points, ...otherProps }: Props) =>
	<path
		d={
			points
				.map(([x, y], i) => {
					const operation = i === 0 ? 'M' : 'L';
					return `${operation}${x} ${y}`;
				})
				.join(' ')
		}
		{...otherProps}
	/>;

export default SVGPathLine;
