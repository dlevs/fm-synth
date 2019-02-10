import React, { MouseEvent, RefObject, useRef, useState } from 'react'
import { css } from 'emotion'
import findLast from 'lodash/findLast'
import range from 'lodash/range'
import InputKeyboardKey from './InputKeyboardKey'
import useSize from '../hooks/useSize'
import useMouseDownStatus from '../hooks/useMouseDownStatus'
import { WHITE_KEYS_WITH_BLACK, WHITE_KEYS_PER_OCTAVE } from '../lib/constants'
import { Note } from '../lib/types'

const keyContainer = css`
	position: relative;
	display: flex;
	height: 200px;
`

interface Props {
	onNoteOn (data: Note): void
	onNoteOff (data: Note): void
	activeNotes: Note[]
	keyWidth?: number
}

const hasBlackKey = (whiteKeyIndex: number) => {
	return WHITE_KEYS_WITH_BLACK.includes(whiteKeyIndex % (WHITE_KEYS_PER_OCTAVE - 1))
}

export const InputKeyboard = ({
	keyWidth = 60,
	activeNotes,
	onNoteOn,
	onNoteOff
}: Props) => {
	const container: RefObject<HTMLDivElement | null> = useRef(null)
	const { width } = useSize(container)
	const { isMouseDown, mouseDownProps } = useMouseDownStatus()
	const [mouseNote, setMouseNote] = useState(null as null | number)
	const numberOfWhiteKeys = Math.floor(width / keyWidth)
	const widthPerKey = width / numberOfWhiteKeys

	const getLastOfNote = (note: number) =>
		findLast(activeNotes, { note })

	// TODO: Move this to be a reselect selector
	const getLastVelocityOfNote = (note: number) => {
		const lastOfNote = getLastOfNote(note)
		return lastOfNote ? lastOfNote.velocity : 0
	}

	const onMouseDown = (event: MouseEvent) => {
		const note = Number((event.target as HTMLElement).dataset.note)
		onNoteOn({ note, velocity: 127 })
		setMouseNote(note)
	}

	const onMouseEnter = (event: MouseEvent) => {
		if (isMouseDown) {
			onMouseDown(event)
		}
	}

	const releaseMouseNote = () => {
		if (mouseNote === null) {
			return
		}
		// TODO: put this logic in "component will update"?
		onNoteOff({ note: mouseNote, velocity: 127 })
		setMouseNote(null)
	}

	// TODO: Make lowest note configurable via an octave parameter
	let keyCount = 36
	const keyProps = {
		// TODO: These functions are created every single render. Look at recommended react hook patterns.
		onMouseDown,
		onMouseEnter,
		onMouseUp: releaseMouseNote,
		onMouseLeave: releaseMouseNote
	}
	keyCount++

	return (
		<div
			ref={container as RefObject<HTMLDivElement>}
			className={keyContainer}
			{...mouseDownProps}
		>
			{range(numberOfWhiteKeys).map(i => {
				const isLastKey = i === numberOfWhiteKeys - 1
				const nodes = []

				{
					const note = keyCount++
					nodes.push(
						<InputKeyboardKey
							key='white'
							color='white'
							velocity={getLastVelocityOfNote(note)}
							note={note}
							{...keyProps}
						/>
					)
				}

				if (!isLastKey && hasBlackKey(i)) {
					const note = keyCount++
					nodes.push(
						<InputKeyboardKey
							key='black'
							color='black'
							note={note}
							velocity={getLastVelocityOfNote(note)}
							style={{
								left: widthPerKey * (i + 1),
								width: widthPerKey * 0.6
							}}
							{...keyProps}
						/>
					)
				}

				return nodes
			})}
		</div>
	)
}

export default InputKeyboard
