export const clearCanvas = (ctx) => {
  const { canvas } = ctx;

  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

export const drawCircle = (ctx, x, y, radius) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.stroke();
}

export const resizeCanvas = (ctx, width, height) => {
  const { canvas } = ctx;

  canvas.height = height === 'fill' ? canvas.clientHeight : height;
  canvas.width = width === 'fill' ? canvas.offsetWidth : width;
}
