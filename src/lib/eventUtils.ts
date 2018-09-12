import React from 'react';

type LooseMouseEvent = MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent;
type LooseMouseEventListener = (event: Event | React.MouseEvent | React.TouchEvent) => void;
type EventDefinition = [EventTarget, string, LooseMouseEventListener];

export const getRelativeMouseCoordinates = (
	event: LooseMouseEvent,
	element?: HTMLElement,
) => {
	const bounds = (element || event.target as HTMLElement).getBoundingClientRect();
	const { pageX, pageY } = 'touches' in event
		? event.touches[0]
		: event;

	return {
		x: pageX - bounds.left,
		y: pageY - bounds.top,
	};
};

export class EventManager {
	private readonly getEvents: () => EventDefinition[];
	private events: EventDefinition[];

	constructor(getEvents: () => EventDefinition[]) {
		this.getEvents = getEvents;
	}

	public listen() {
		this.events = this.events || this.getEvents();
		this.events.forEach(([element, eventType, callback]: EventDefinition) => {
			element.addEventListener(eventType, callback as EventListener);
		});
		return this;
	}

	public stopListening() {
		this.events.forEach(([element, eventType, callback]: EventDefinition) => {
			element.removeEventListener(eventType, callback as EventListener);
		});
		return this;
	}
}
