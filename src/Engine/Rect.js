class Rect {
  constructor({ ctx, x, y, width, height, strokeColor }) {
    this.ctx = ctx;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.strokeColor = strokeColor ?? null;
  }
  draw() {
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y, this.width, this.width);
    this.strokeColor && (this.ctx.strokeStyle = this.strokeColor);
    this.ctx.stroke();
  }
}

export default Rect;
