import range from 'lodash/range';
import React, { Component, createRef, RefObject } from 'react';
import { defaultProps } from 'recompose';
import { EventManager } from '../lib/eventUtils';
import { Omit } from '../lib/types';
import { css } from 'emotion';
import MouseDownStatus from './util/MouseDownStatus';

const keyContainer = css`
	position: relative;
	display: flex;
	height: 200px;
`;

const keyStyle = css`
	appearance: none;
	border: none;
	cursor: pointer;
`;

const keyWhite = css`
	${keyStyle}
	outline: 1px solid #000;
	flex: 1;
	background: #fff;

	&:hover, &:focus {
		background: #eee;
	}

	&:active {
		background: #ccc;
	}
`;

// TODO: Be consistent with ordering of words in "keyBlack" and "BlackKey"
const keyBlack = css`
	${keyStyle}
	background: #000;
	position: absolute;
	top: 0;
	bottom: 40%;
	width: 40px;
	transform: translateX(-50%);

	&:hover, &:focus {
		background: #eee;
	}

	&:active {
		background: #ccc;
	}
`;

class DefaultProps {
	keyWidth = 70;
}

interface Props extends DefaultProps {
	isMouseDown: boolean;
}

class State {
	numberOfWhiteKeys = 0;
}

const KEYBOARD_MAP = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\\'];
const WHITE_KEYS_WITH_BLACK = [0, 1, 3, 4, 5];
const WHITE_KEYS_PER_OCTAVE = 8;

// TODO: Move me
interface KeyProps {
	children?: React.ReactNode;
	style?: React.CSSProperties;
}
const WhiteKey = ({ children, style }: KeyProps) =>
	<button className={keyWhite} style={style}>{children}</button>;

const BlackKey = ({ children, style }: KeyProps) =>
	<button className={keyBlack} style={style}>{children}</button>;

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
		const widthPerKey = this.getWidthPerKey();
		const { numberOfWhiteKeys } = this.state;

		return (
			<div className={keyContainer} ref={this.container}>
				{range(numberOfWhiteKeys).map(i => {
					const isLastKey = i === numberOfWhiteKeys - 1;
					const nodes = [
						<WhiteKey key='white'>
							{KEYBOARD_MAP[i] || ''}
						</WhiteKey>,
					];

					if (!isLastKey && hasBlackKey(i)) {
						nodes.push(
							<BlackKey
								key='black'
								style={{ left: widthPerKey * (i + 1) }}
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
