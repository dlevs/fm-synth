import last from 'lodash/last';
import { Point } from '../lib/types';

export const cumulativeX = (points: Point[]) => points
	.reduce((accum, [x, y]) => {
		const [lastX] = last(accum) || [0, 0];
		return [
			...accum,
			[x + lastX, y],
		] as Point[];
	}, [] as Point[]);
