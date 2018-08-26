export default class EventManager {
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
