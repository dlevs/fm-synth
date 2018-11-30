interface ActionCreator<T extends string> {
	(): {
		type: T;
	};
	type: T;
}

interface ActionWithPayloadCreator<T extends string, P> {
	(payload: P): {
		type: T;
		payload: P;
	};
	type: T;
}

function createAction<T extends string>(type: T): ActionCreator<T>;
function createAction<T extends string, P>(type: T): ActionWithPayloadCreator<T, P>;
function createAction<T extends string, P>(type: T) {
	const actionCreator = (payload?: P) =>
		payload === undefined
			? { type }
			: { type, payload };

	actionCreator.type = type;

	return actionCreator;
}

export default createAction;
