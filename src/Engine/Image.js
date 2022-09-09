class CanvasImage {
  constructor({ ctx, image, x, y, width, height, crop = null }) {
    this.ctx = ctx;

    this.image = image;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.crop = crop;
  }
  draw() {
    const params = [this.x, this.y, this.width, this.height];
    if (this.crop) params.unshift(...Object.values(this.crop));

    this.ctx.drawImage(this.image, ...params);
  }
}

export default CanvasImage;
