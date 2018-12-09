import React, { SVGAttributes } from 'react';
import { Point } from '../lib/types';

interface Props extends SVGAttributes<SVGPolylineElement> {
	pointsArray: Point[];
}

export const SVGPolyline = ({ pointsArray, ...otherProps }: Props) =>
	<polyline
		points={
			pointsArray
				.map(coordinates => coordinates.join(','))
				.join(' ')
		}
		{...otherProps}
	/>;

export default SVGPolyline;
