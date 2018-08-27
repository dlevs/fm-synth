type EventDefinition = [EventTarget, string, () => void];

export const getRelativeMouseCoordinates = (event: MouseEvent | TouchEvent, element?: HTMLElement) => {
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
			element.addEventListener(eventType, callback);
		});
		return this;
	}

	public stopListening() {
		this.events.forEach(([element, eventType, callback]: EventDefinition) => {
			element.removeEventListener(eventType, callback);
		});
		return this;
	}
}
