import React from 'react';

type LooseMouseEvent = MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent;
type LooseMouseEventListener = (event: LooseMouseEvent) => void;
type EventDefinition = [EventTarget, string, LooseMouseEventListener];

export const getRelativeMouseCoordinates = (
	event: LooseMouseEvent,
	element?: HTMLElement
) => {
  const bounds = (element || event.target as HTMLElement).getBoundingClientRect();
	const { pageX, pageY } = 'touches' in event
		? event.touches[0]
		: event;

  return {
    x: pageX - bounds.left,
    y: pageY - bounds.top
  };
}

export class EventManager {
	private events: EventDefinition[];

	constructor(events: EventDefinition[]) {
		this.events = events;
	}

	public listen() {
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
