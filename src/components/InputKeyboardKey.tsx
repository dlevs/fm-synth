import React, { MouseEvent } from 'react';
import classnames from 'classnames';
import Color from 'color';
import { velocityColorMixScale } from '../lib/scales';
import { css } from 'emotion';
import { KEY_INDEX_TO_KEYBOARD_KEY_MAP } from '../lib/constants';

const activeKeyColor = Color('#5492f5');

const keyStyle = css`
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	text-align: center;
	align-items: center;
	appearance: none;
	border: none;
	cursor: pointer;
	padding-bottom: 10px;
	user-select: none;
	transition: background 300ms, color 300ms;
`;

// TODO: Make variables for CSS colors
const keyWhite = css`
	${keyStyle}
	color: #111;
	outline: 1px solid #111;
	flex: 1;
	background: #fff;

	&:hover, &:focus { background: #eee; }
`;

// TODO: Be consistent with ordering of words in "keyBlack" and "BlackKey"
const keyBlack = css`
	${keyStyle}
	color: #fff;
	background: #111;
	position: absolute;
	top: 0;
	bottom: 40%;
	transform: translateX(-50%);
	outline: none;
	border: 1px #111 solid;
	border-top: none;
	border-bottom-left-radius: 8px;
	border-bottom-right-radius: 8px;

	&:hover, &:focus { background: #222; }
`;

// TODO: important...?
// TODO: Divide by max velocity in fn above?
const keyActive = (color: string, velocity: number) => css`
	background: ${Color(color).mix(activeKeyColor, velocityColorMixScale(velocity)).toString()} !important;
	color: #fff;
	transition: all 0s !important;
`;

// TODO: Move me
interface KeyProps {
	color: 'white' | 'black';
	style?: React.CSSProperties;
	onMouseDown(event: MouseEvent): void;
	onMouseUp(event: MouseEvent): void;
	onMouseEnter(event: MouseEvent): void;
	onMouseLeave(event: MouseEvent): void;
	velocity: number;
	note: number;
}

const InputKeyboard = ({
	color,
	style,
	onMouseDown,
	onMouseUp,
	onMouseEnter,
	onMouseLeave,
	velocity,
	note,
}: KeyProps) => {
	// TODO: Not sure how efficient it is to make this styling per key. check...
	const cssClass = color === 'white' ? keyWhite : keyBlack;
	const activeColor = color === 'white' ? '#fff' : '#111';
	return (
		<div
			className={classnames(cssClass, {
				// TODO: This doesn't make much sense
				[keyActive(activeColor, velocity)]: velocity > 0,
			})}
			style={style}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			data-note={note}
		>
			{KEY_INDEX_TO_KEYBOARD_KEY_MAP[note] || ''}
		</div>
	);
};

export default InputKeyboard;
