import React, { MouseEvent } from 'react'
import Color from 'color'
import { velocityColorMixScale } from '../lib/scales'
import { css, cx } from 'emotion'
import { KEY_INDEX_TO_KEYBOARD_KEY_MAP } from '../lib/constants'

const COLOR_ACTIVE_KEY = Color('#2c76ec')
const COLOR_WHITE_KEY = Color('#fff')
const COLOR_BLACK_KEY = Color('#111')
const COLOR_HOVER_RATIO = 0.1

// TODO: Make a naming convention for style variable names
const baseKey = css`
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
`

const whiteKey = css`
	${baseKey}
	color: #111;
	outline: 1px solid #111;
	flex: 1;
	background: ${COLOR_WHITE_KEY.toString()};

	&:hover, &:focus {
		background: ${COLOR_WHITE_KEY.darken(COLOR_HOVER_RATIO).toString()};
	}
`

const blackKey = css`
	${baseKey}
	color: #fff;
	background: ${COLOR_BLACK_KEY.toString()};
	position: absolute;
	top: 0;
	bottom: 40%;
	transform: translateX(-50%);
	outline: none;
	border: 1px #111 solid;
	border-top: none;
	border-bottom-left-radius: 8px;
	border-bottom-right-radius: 8px;

	&:hover, &:focus {
		background: ${COLOR_BLACK_KEY.lighten(COLOR_HOVER_RATIO).toString()};
	}
`

// TODO: might make more sense to have velocity be between 0 - 1 here. Decide at which point to decouple from MIDI scale 0 - 127.
const activeKey = (backgroundColor: Color, velocity: number) => css`
	background: ${backgroundColor.mix(COLOR_ACTIVE_KEY, velocityColorMixScale(velocity)).toString()} !important;
	color: #fff;
	transition: all 0s;
`

const colorSettingsMap = {
	white: {
		cssClass: whiteKey,
		backgroundColor: COLOR_WHITE_KEY
	},
	black: {
		cssClass: blackKey,
		backgroundColor: COLOR_BLACK_KEY
	}
}

interface Props {
	color: 'white' | 'black'
	velocity: number
	note: number
	style?: React.CSSProperties
	onMouseDown (event: MouseEvent): void
	onMouseUp (event: MouseEvent): void
	onMouseEnter (event: MouseEvent): void
	onMouseLeave (event: MouseEvent): void
}

const InputKeyboardKey = ({
	color,
	style,
	onMouseDown,
	onMouseUp,
	onMouseEnter,
	onMouseLeave,
	velocity,
	note
}: Props) => {
	const { cssClass, backgroundColor } = colorSettingsMap[color]
	const cssClasses = [cssClass]

	if (velocity > 0) {
		cssClasses.push(activeKey(backgroundColor, velocity))
	}

	return (
		<div
			className={cx(cssClasses)}
			style={style}
			onMouseDown={onMouseDown}
			onMouseUp={onMouseUp}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			data-note={note}
		>
			{KEY_INDEX_TO_KEYBOARD_KEY_MAP[note] || ''}
		</div>
	)
}

export default InputKeyboardKey
