import range from 'lodash/range';
import React, { Component, createRef, RefObject } from 'react';
import { defaultProps } from 'recompose';
import { EventManager } from '../lib/eventUtils';
import { Omit } from '../lib/types';
import { css } from 'emotion';
import MouseDownStatus from './util/MouseDownStatus';

const keyContainer = css`
	display: flex;
	height: 200px;
`;

const keyWhite = css`
	appearance: none;
	border: none;
	outline: 1px solid #000;
	flex: 1;
	background: #fff;
	cursor: pointer;

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

const keyboardMap = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\\'];

class InputKeyboardBase extends Component<Props> {
	public state = new State();
	public events: EventManager;

	container: RefObject<HTMLDivElement> = createRef();

	private readonly updateNumberOfWhiteKeys = () => {
		if (!this.container.current) {
			return;
		}

		this.setState({
			numberOfWhiteKeys: Math.floor(this.container.current.clientWidth / this.props.keyWidth),
		});
	};

	private readonly onKeyDown = ({ key }: KeyboardEvent) => {
		const index = keyboardMap.indexOf(key);

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
		return (
			<div className={keyContainer} ref={this.container}>
				{range(this.state.numberOfWhiteKeys).map(i =>
					<button key={i} className={keyWhite}>{keyboardMap[i] || ''}</button>,
				)}
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
