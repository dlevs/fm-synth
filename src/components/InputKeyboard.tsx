import range from 'lodash/range';
import React, { Component, createRef, RefObject, MouseEvent } from 'react';
import { defaultProps } from 'recompose';
import { EventManager } from '../lib/eventUtils';
import { Omit } from '../lib/types';
// TODO: Move this type into lib/types?
import { Note } from '../store/notesReducer';
import { css } from 'emotion';
import MouseDownStatus from './util/MouseDownStatus';

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
`;

// TODO: Make variables for CSS colors
const keyWhite = css`
	${keyStyle}
	color: #111;
	outline: 1px solid #111;
	flex: 1;
	background: #fff;

	&:hover, &:focus { background: #eee; }
	&:active {
		background: #ccc;
	}
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
	border-bottom-left-radius: 8px;
	border-bottom-right-radius: 8px;

	&:hover, &:focus { background: #222; }
	&:active { background: #333; }
`;

class DefaultProps {
	keyWidth = 60;
}

interface Props extends DefaultProps {
	isMouseDown: boolean;
	onNoteOn(data: Note): void;
	onNoteOff(data: Note): void;
}

class State {
	numberOfWhiteKeys = 0;
}

const KEYBOARD_MAP = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k', 'o', 'l', 'p', ';', '\\'];
const WHITE_KEYS_WITH_BLACK = [0, 1, 3, 4, 5];
const WHITE_KEYS_PER_OCTAVE = 8;

// TODO: Move me
interface KeyProps {
	style?: React.CSSProperties;
	onMouseDown(event: MouseEvent<HTMLButtonElement>): void;
	onMouseUp(event: MouseEvent<HTMLButtonElement>): void;
	value: number;
}
// TODO: These key components are a bit redundant. Get rid of them / simplify
const WhiteKey = ({ style, onMouseDown, onMouseUp, value }: KeyProps) =>
	<button
		className={keyWhite}
		style={style}
		onMouseDown={onMouseDown}
		onMouseUp={onMouseUp}
		value={value}
	>
		{KEYBOARD_MAP[value] || ''}
	</button>;

const BlackKey = ({ style, onMouseDown, onMouseUp, value }: KeyProps) =>
	<button
		className={keyBlack}
		style={style}
		onMouseDown={onMouseDown}
		onMouseUp={onMouseUp}
		value={value}
	>
		{KEYBOARD_MAP[value] || ''}
	</button>;

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

	private readonly onMouseOver = (event: MouseEvent) => {
		console.log(event);
	};

	private readonly onMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
		this.props.onNoteOn({
			note: Number((event.target as HTMLButtonElement).value),
			velocity: 127,
		});
	};

	private readonly onMouseUp = (event: MouseEvent<HTMLButtonElement>) => {
		this.props.onNoteOff({
			note: Number((event.target as HTMLButtonElement).value),
			velocity: 127,
		});
	};

	public componentDidMount() {
		this.updateNumberOfWhiteKeys();
		this.events = new EventManager(() => [
			[window, 'resize', this.updateNumberOfWhiteKeys],
			[document, 'mouseover', this.onMouseOver],
			[document, 'keydown', this.onKeyDown],
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
		const keyProps = {
			onMouseDown: this.onMouseDown,
			onMouseUp: this.onMouseUp,
		};

		return (
			<div className={keyContainer} ref={this.container}>
				{range(numberOfWhiteKeys).map(i => {
					const isLastKey = i === numberOfWhiteKeys - 1;
					const nodes = [
						<WhiteKey key='white' value={keyCount++} {...keyProps} />,
					];

					if (!isLastKey && hasBlackKey(i)) {
						nodes.push(
							<BlackKey
								key='black'
								value={keyCount++}
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
