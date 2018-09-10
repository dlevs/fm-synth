type Dimension = number | 'fill';

export const clearCanvas = (ctx: CanvasRenderingContext2D) => {
	const { canvas } = ctx;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
};

export const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2, false);
	ctx.fill();
	ctx.stroke();
};

export const resizeCanvas = (ctx: CanvasRenderingContext2D, width: Dimension, height: Dimension) => {
	const { canvas } = ctx;

	canvas.height = height === 'fill' ? canvas.clientHeight : height;
	canvas.width = width === 'fill' ? canvas.offsetWidth : width;
};
