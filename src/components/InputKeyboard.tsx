import range from 'lodash/range';
import findLast from 'lodash/findLast';
import classnames from 'classnames';
import { css } from 'emotion';
import Color from 'color';
import React, { Component, createRef, RefObject, MouseEvent } from 'react';
import { defaultProps } from 'recompose';
import { EventManager } from '../lib/eventUtils';
import { velocityColorMixScale } from '../lib/scales';
import { Omit } from '../lib/types';
import MouseDownStatus from './util/MouseDownStatus';
// TODO: Move this type into lib/types?
import { Note, NoteStatus } from '../store/reducers/notesReducer';

const KEYBOARD_MAP = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k', 'o', 'l', 'p', ';', '\\'];
const WHITE_KEYS_WITH_BLACK = [0, 1, 3, 4, 5];
const WHITE_KEYS_PER_OCTAVE = 8;

const activeKeyColor = Color('#5492f5');

const keyContainer = css`
	position: relative;
	display: flex;
	height: 200px;
`;

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

class DefaultProps {
	keyWidth = 60;
}

interface Props extends DefaultProps {
	onNoteOn(data: Note): void;
	onNoteOff(data: Note): void;
	activeNotes: NoteStatus[];
	isMouseDown: boolean;
}

class State {
	numberOfWhiteKeys = 0;
	currentMouseNote: number | null = null;
}

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
// TODO: These key components are a bit redundant. Get rid of them / simplify
const KeyboardKey = ({
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
			{KEYBOARD_MAP[note] || ''}
		</div>
	);
};

const hasBlackKey = (whiteKeyIndex: number) => {
	return WHITE_KEYS_WITH_BLACK.includes(whiteKeyIndex % (WHITE_KEYS_PER_OCTAVE - 1));
};

class InputKeyboardBase extends Component<Props> {
	public state = new State();
	public events: EventManager;

	container: RefObject<HTMLDivElement> = createRef();

	private readonly updateNumberOfWhiteKeys = () => {
		this.setState({
			numberOfWhiteKeys: Math.floor(this.getWidth() / this.props.keyWidth),
		});
	};

	private getWidth() {
		if (!this.container.current) {
			return 0;
		}

		return this.container.current.clientWidth;
	}

	private getWidthPerKey() {
		return this.getWidth() / this.state.numberOfWhiteKeys;
	}

	private readonly onKeyDown = ({ key }: KeyboardEvent) => {
		const index = KEYBOARD_MAP.indexOf(key);

		if (index === -1) {
			return;
		}

		console.log(`Key ${index} activated`);
	};

	private readonly onMouseDown = (event: MouseEvent) => {
		const note = Number((event.target as HTMLElement).dataset.note);
		this.props.onNoteOn({
			note,
			velocity: 127,
		});
		this.setState({ currentMouseNote: note });
	};

	private readonly onMouseEnter = (event: MouseEvent) => {
		if (this.props.isMouseDown) {
			this.onMouseDown(event);
		}
	};

	private readonly releaseCurrentMouseNote = () => {
		const { currentMouseNote } = this.state;
		if (currentMouseNote === null) {
			return;
		}
		// TODO: put this logic in "component will update"?
		this.props.onNoteOff({
			note: currentMouseNote,
			velocity: 127,
		});
		this.setState({ currentMouseNote: null });
	};

	// TODO: Move this to be a reselect selector
	private getLastOfNote(note: number) {
		const { activeNotes } = this.props;
		return findLast(activeNotes, { note });
	}

	// TODO: Move this to be a reselect selector
	private getLastVelocityOfNote(note: number) {
		const lastOfNote = this.getLastOfNote(note);
		return lastOfNote ? lastOfNote.velocity : 0;
	}

	public componentDidMount() {
		this.updateNumberOfWhiteKeys();
		this.events = new EventManager(() => [
			[window, 'resize', this.updateNumberOfWhiteKeys],
			[document, 'keydown', this.onKeyDown],
		]);
		this.events.listen();
	}

	public componentWillUnmount() {
		this.events.stopListening();
	}

	public render() {
		// TODO: Make lowest note configurable via an octave parameter
		let keyCount = 36;
		const { numberOfWhiteKeys } = this.state;
		const widthPerKey = this.getWidthPerKey();
		const keyProps = {
			onMouseDown: this.onMouseDown,
			onMouseUp: this.releaseCurrentMouseNote,
			onMouseEnter: this.onMouseEnter,
			onMouseLeave: this.releaseCurrentMouseNote,
		};

		return (
			<div className={keyContainer} ref={this.container}>
				{range(numberOfWhiteKeys).map(i => {
					const isLastKey = i === numberOfWhiteKeys - 1;
					const nodes = [];

					{
						const note = keyCount++;
						nodes.push(
							<KeyboardKey
								key='white'
								color='white'
								velocity={this.getLastVelocityOfNote(note)}
								note={note}
								{...keyProps}
							/>,
						);
					}

					if (!isLastKey && hasBlackKey(i)) {
						const note = keyCount++;
						nodes.push(
							<KeyboardKey
								key='black'
								color='black'
								note={note}
								velocity={this.getLastVelocityOfNote(note)}
								style={{
									left: widthPerKey * (i + 1),
									width: widthPerKey * 0.6,
								}}
								{...keyProps}
							/>,
						);
					}

					return nodes;
				})}
			</div>
		);
	}
}

const withDefaultProps = defaultProps(new DefaultProps());
const InputKeyboard = (props: Omit<Props, 'isMouseDown'>) =>
	<MouseDownStatus>{({ isMouseDown }) =>
		<InputKeyboardBase
			{...props}
			isMouseDown={isMouseDown}
		/>
	}</MouseDownStatus>;

export default withDefaultProps(InputKeyboard);
