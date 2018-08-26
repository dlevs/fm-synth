export const getRelativeMouseCoordinates = (event, element) => {
  const bounds = (element || event.target).getBoundingClientRect();
  const touch = event.touches ? event.touches[0] : null;
  const { pageX, pageY } = touch || event;

  return {
    x: pageX - bounds.left,
    y: pageY - bounds.top
  };
}

export class EventManager {
	constructor(events) {
		this.events = events;
	}

	listen() {
		this.events.forEach(([element, ...args]) => {
			element.addEventListener(...args);
		});
		return this;
	}

	stopListening() {
		this.events.forEach(([element, ...args]) => {
			element.removeEventListener(...args);
		});
		return this;
	}
}
