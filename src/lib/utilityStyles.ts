import { css } from 'emotion'

export const styleVisuallyHidden = css`
	position: absolute;
	overflow: hidden;
	clip: rect(0 0 0 0);
	height: 1px; width: 1px;
	margin: -1px; padding: 0; border: 0;
`
