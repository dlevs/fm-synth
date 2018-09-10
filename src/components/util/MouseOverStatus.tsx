import React, { Component } from 'react';
import { RenderPropComponentProps } from '../../lib/types';

class State {
	public isMouseOver = false;
}

export default class MouseOverStatus extends Component<RenderPropComponentProps<State>, State> {
	public state = new State();

	public render() {
		return (
			<div onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
				{this.props.children(this.state)}
			</div>
		);
	}

	private readonly onMouseEnter = () => this.setState({ isMouseOver: true });
	private readonly onMouseLeave = () => this.setState({ isMouseOver: false });
}
