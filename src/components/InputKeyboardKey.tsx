import { css } from '@emotion/core'
import { MouseEvent } from 'react'
import { darken, lighten } from 'polished'
// import { velocityColorMixScale } from '../lib/scales'
import { KEY_INDEX_TO_KEYBOARD_KEY_MAP } from '../lib/constants.js'

// const COLOR_ACTIVE_KEY = Color('#2c76ec')
const COLOR_WHITE_KEY = '#fff'
const COLOR_BLACK_KEY = '#111'
const COLOR_HOVER_RATIO = 0.1

// TODO: Make a naming convention for style variable names
const baseKey = css({
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'flex-end',
	textAlign: 'center',
	alignItems: 'center',
	appearance: 'none',
	border: 'none',
	cursor: 'pointer',
	paddingBottom: 10,
	userSelect: 'none',
	transition: 'background 300ms, color 300ms'
})

const whiteKey = css([
	baseKey,
	{
		color: '#111',
		outline: '1px solid #111',
		flex: 1,
		background: COLOR_WHITE_KEY,

		':hover, :focus': {
			background: darken(COLOR_HOVER_RATIO, COLOR_WHITE_KEY)
		}
	}
])

const blackKey = css([
	baseKey,

	{
		color: '#fff',
		background: COLOR_BLACK_KEY,
		position: 'absolute',
		top: 0,
		bottom: '40%',
		transform: 'translateX(-50%)',
		outline: 'none',
		border: '1px #111 solid',
		borderTop: 'none',
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,

		':hover, :focus': {
			background: lighten(COLOR_HOVER_RATIO, COLOR_BLACK_KEY)
		}
	}
])

// TODO: might make more sense to have velocity be between 0 - 1 here. Decide at which point to decouple from MIDI scale 0 - 127.
// TODO: Is !important necessary??
// const activeKey = (backgroundColor: Color, velocity: number) => css({
// 	background: `${backgroundColor.mix(COLOR_ACTIVE_KEY, velocityColorMixScale(velocity))} !important`,
// 	color: '#fff',
// 	transition: 'all 0s'
// })

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
	color: 'white' | 'black';
	velocity: number;
	note: number;
	style?: React.CSSProperties;
	onMouseDown (event: MouseEvent): void;
	onMouseUp (event: MouseEvent): void;
	onMouseEnter (event: MouseEvent): void;
	onMouseLeave (event: MouseEvent): void;
}

const InputKeyboardKey = ({
	color,
	style,
	onMouseDown,
	onMouseUp,
	onMouseEnter,
	onMouseLeave,
	note
}: Props) => {
	const { cssClass } = colorSettingsMap[color]
	// TODO: Add this back:
	// const cssClasses = [cssClass]

	// if (velocity > 0) {
	// 	cssClasses.push(activeKey(backgroundColor, velocity))
	// }

	return (
		<div
			css={cssClass}
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
