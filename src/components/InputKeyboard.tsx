import React, { Component, createRef, RefObject, MouseEvent } from 'react';
import range from 'lodash/range';
import findLast from 'lodash/findLast';
import { css } from 'emotion';
import { defaultProps } from 'recompose';
import { EventManager } from '../lib/eventUtils';
import { Omit } from '../lib/types';
import { WHITE_KEYS_WITH_BLACK, WHITE_KEYS_PER_OCTAVE } from '../lib/constants';
import MouseDownStatus from './hooks/MouseDownStatus';
// TODO: Move this type into lib/types?
import InputKeyboardKey from './InputKeyboardKey';
import { Note, NoteStatus } from '../store/reducers/notesReducer';

const keyContainer = css`
	position: relative;
	display: flex;
	height: 200px;
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
							<InputKeyboardKey
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
							<InputKeyboardKey
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
