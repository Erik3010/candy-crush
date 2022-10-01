import CanvasImage from "./Engine/Image";
import Rect from "./Engine/Rect";
import Circle from "./Engine/Circle";
import Utility from "./Utility";

import { SPRITE_IMAGE_PATH } from "./constant";

class Candy {
  constructor({
    ctx,
    coordinate,
    x = null,
    y = null,
    targetX = null,
    targetY = null,
    width,
    type,
    image,
  }) {
    this.ctx = ctx;

    this.coordinate = {
      x: coordinate.x,
      y: coordinate.y,
    };

    this.width = width;

    this.x = x ?? this.coordinate.x * this.width;
    this.y = y ?? this.coordinate.y * this.width;

    this.targetX = targetX ?? this.x;
    this.targetY = targetY ?? this.y;

    this.type = type;

    this.selected = false;
    this.destroyable = false;

    this.image = image;
    // this.image = new Image();
    // this.image.src = SPRITE_IMAGE_PATH;

    this.scale = 1;
  }
  draw() {
    this.drawSelectedCandy();

    const padding = (this.width - this.width * this.scale) / 2;
    const scaledUpWidth = padding * (1 / this.scale);

    const image = new CanvasImage({
      ctx: this.ctx,
      image: this.image,
      x: this.x * (1 / this.scale) + scaledUpWidth,
      y: this.y * (1 / this.scale) + scaledUpWidth,
      width: this.width,
      height: this.width,
      crop: {
        x: this.type * this.width,
        y: 0,
        width: this.width,
        height: this.width,
      },
    });

    this.ctx.save();
    this.ctx.scale(this.scale, this.scale);
    image.draw();
    this.ctx.restore();

    // this.drawDestroyableCandy();
  }
  drawSelectedCandy() {
    if (!this.selected) return;

    const rect = new Rect({
      ctx: this.ctx,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.width,
      strokeColor: "#403f3f",
    });

    rect.draw();
  }
  drawDestroyableCandy() {
    if (!this.destroyable) return;

    const circle = new Circle({
      ctx: this.ctx,
      x: this.x + this.width / 2,
      y: this.y + this.width / 2,
      radius: this.width * 0.3,
      fillColor: "#7d7d7d",
      strokeColor: "#1e1e1e",
      opacity: 0.5,
    });

    circle.draw();
  }
  movePosition({ y, x }) {
    this.x = x;
    this.y = y;
  }
  updateTarget({ targetY, targetX }) {
    this.targetY = targetY;
    this.targetX = targetX;
  }
  async movePositionToTarget() {
    return new Promise((resolve) => {
      let interpolation = 0;

      const animate = () => {
        if (Utility.isCandyInTarget(this)) return resolve();

        const fraction = Utility.smootherStep(interpolation);
        const newPosition = {
          x: Number(Utility.lerp(this.x, this.targetX, fraction).toFixed(7)),
          y: Number(Utility.lerp(this.y, this.targetY, fraction).toFixed(7)),
        };

        this.movePosition(newPosition);
        interpolation += 0.01;

        setTimeout(animate, 10);
      };

      animate();
    });
  }
  async animateScaleDown() {
    return new Promise((resolve) => {
      let interpolation = 0;

      const animate = () => {
        if (this.scale === 0) return resolve();

        const fraction = Utility.smootherStep(interpolation);

        this.scale = Number(Utility.lerp(this.scale, 0, fraction).toFixed(7));
        interpolation += 0.02;

        setTimeout(animate, 10);
      };

      animate();
    });
  }
}

export default Candy;
