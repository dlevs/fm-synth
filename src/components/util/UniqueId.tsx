import { Component } from 'react';
import { RenderPropComponentProps } from '../../lib/types';

let uniqueIdCounter = 0;

class State {
	public id = `unique-id-input-${uniqueIdCounter++}`;
}

class UniqueId extends Component<RenderPropComponentProps<State>, State> {
	public state = new State();

	public render() {
		return this.props.children(this.state);
	}
}

export default UniqueId;
