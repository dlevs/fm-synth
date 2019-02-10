// TODO: Do separate style files for other components
import Color from 'color';
import { css } from 'emotion';

export const dotSize = 6;
export const dotSizeActive = 12;
export const padding = dotSizeActive;

export const wrapper = css`
	padding: ${padding}px;
	cursor: grab;
	user-select: none;
	touch-action: none;
`;

// TODO: Remove me:
// &:not([data-status="inactive"]) {
// 	polyline {
// 		/* stroke-width: 1.5px; */
// 	}
// }

// &[data-status="active"] {
// 	cursor: grabbing;
// }

export const svg = css`
	display: block;
	overflow: visible;
`;

export const svgBase = (color: string) => css`
	vector-effect: non-scaling-stroke;
	stroke-width: 1;
	stroke: ${color};
	fill: none;
`;

export const circle = (color: string) => css`
	${svgBase(color)}
	position: relative;
	z-index: 1;
	stroke-width: ${dotSize};

	&[data-active="true"] {
		stroke-width: ${dotSizeActive};
	}
`;

export const rangeGuideBox = (color: string) => css`
	position: relative;
	z-index: -1;
	pointer-events: none;
	fill: ${Color(color).alpha(0.1).toString()};
`;
