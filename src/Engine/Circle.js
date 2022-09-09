class Circle {
  constructor({ ctx, x, y, radius, strokeColor, fillColor, opacity }) {
    this.ctx = ctx;

    this.x = x;
    this.y = y;
    this.radius = radius;

    this.strokeColor = strokeColor ?? null;
    this.fillColor = fillColor ?? null;

    this.opacity = opacity ?? 1;
  }
  draw() {
    this.ctx.save();

    this.ctx.globalAlpha = this.opacity;

    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.strokeColor && (this.ctx.strokeStyle = this.strokeColor);
    this.fillColor && (this.ctx.fillStyle = this.fillColor);
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.closePath();
    this.ctx.restore();
  }
}

export default Circle;
