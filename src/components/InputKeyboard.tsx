import range from 'lodash/range';
import findLast from 'lodash/findLast';
import classnames from 'classnames';
import React, { Component, createRef, RefObject, MouseEvent } from 'react';
import { defaultProps } from 'recompose';
import { EventManager } from '../lib/eventUtils';
import { velocityColorMixScale } from '../lib/scales';
// TODO: Move this type into lib/types?
import { Note, NoteStatus } from '../store/notesReducer';
import { css } from 'emotion';
import Color from 'color';

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

const activeColor = Color('#5492f5');

// TODO: important...?
// TODO: Divide by max velocity in fn above?
const keyActive = (color: string, velocity: number) => css`
	background: ${Color(color).mix(activeColor, velocityColorMixScale(velocity)).toString()} !important;
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
}

class State {
	numberOfWhiteKeys = 0;
	// TODO: Use the MouseDownStatus component?
	isMouseDown = false;
	currentMouseNote: number | null = null;
}

const KEYBOARD_MAP = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k', 'o', 'l', 'p', ';', '\\'];
const WHITE_KEYS_WITH_BLACK = [0, 1, 3, 4, 5];
const WHITE_KEYS_PER_OCTAVE = 8;

// TODO: Move me
interface KeyProps {
	style?: React.CSSProperties;
	onMouseDown(event: MouseEvent): void;
	onMouseUp(event: MouseEvent): void;
	onMouseEnter(event: MouseEvent): void;
	onMouseLeave(event: MouseEvent): void;
	velocity: number;
	value: number;
}
// TODO: These key components are a bit redundant. Get rid of them / simplify
const WhiteKey = ({ style, onMouseDown, onMouseUp, onMouseEnter, onMouseLeave, velocity, value }: KeyProps) =>
	// TODO: Break this out.
	// TODO: Not sure how efficient it is to make this styling per key. check...
	<div
		className={classnames(keyWhite, {
			// TODO: This doesn't make much sense
			[keyActive('#fff', velocity)]: velocity > 0,
		})}
		style={style}
		onMouseDown={onMouseDown}
		onMouseUp={onMouseUp}
		onMouseEnter={onMouseEnter}
		onMouseLeave={onMouseLeave}
		data-value={value}
	>
		{KEYBOARD_MAP[value] || ''}
	</div>;

const BlackKey = ({ style, onMouseDown, onMouseUp, onMouseEnter, onMouseLeave, velocity, value }: KeyProps) =>
	<div
		className={classnames(keyBlack, {
			[keyActive('#111', velocity)]: velocity > 0,
		})}
		style={style}
		onMouseDown={onMouseDown}
		onMouseUp={onMouseUp}
		onMouseEnter={onMouseEnter}
		onMouseLeave={onMouseLeave}
		data-value={value}
	>
		{KEYBOARD_MAP[value] || ''}
	</div>;

const hasBlackKey = (whiteKeyIndex: number) => {
	return WHITE_KEYS_WITH_BLACK.includes(whiteKeyIndex % (WHITE_KEYS_PER_OCTAVE - 1));
};

class InputKeyboard extends Component<Props> {
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
		const note = Number((event.target as HTMLElement).dataset.value);
		this.props.onNoteOn({
			note,
			velocity: 127,
		});
		this.setState({ currentMouseNote: note });
	};

	private readonly onMouseEnter = (event: MouseEvent) => {
		if (this.state.isMouseDown) {
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

	public componentDidMount() {
		this.updateNumberOfWhiteKeys();
		this.events = new EventManager(() => [
			[window, 'resize', this.updateNumberOfWhiteKeys],
			[document, 'keydown', this.onKeyDown],

			// TODO: Use mixin / util component for this
			[document, 'mousedown', () => this.setState({ isMouseDown: true })],
			[document, 'mouseup', () => this.setState({ isMouseDown: false })],
		]);
		this.events.listen();
	}

	public componentWillUnmount() {
		this.events.stopListening();
	}

	public render() {
		let keyCount = 0;
		const widthPerKey = this.getWidthPerKey();
		const { numberOfWhiteKeys } = this.state;
		// TODO: Use reselect here!!!?
		const { activeNotes } = this.props;
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
					const whiteValue = keyCount++;
					const lastWhite = findLast(activeNotes, { note: whiteValue });

					const nodes = [
						<WhiteKey key='white' value={whiteValue} {...keyProps} velocity={lastWhite ? lastWhite.velocity : 0} />,
					];

					if (!isLastKey && hasBlackKey(i)) {
						const blackValue = keyCount++;
						const lastBlack = findLast(activeNotes, { note: blackValue });
						nodes.push(
							<BlackKey
								key='black'
								value={blackValue}
								style={{
									left: widthPerKey * (i + 1),
									width: widthPerKey * 0.6,
								}}
								velocity={lastBlack ? lastBlack.velocity : 0}
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
export default withDefaultProps(InputKeyboard);
