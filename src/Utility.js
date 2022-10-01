import { DIRECTIONS } from "./constant";

class Utility {
  static random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  static isAround(from, target) {
    return DIRECTIONS.some(
      ([dirY, dirX]) => dirY + from.y === target.y && dirX + from.x === target.x
    );
  }
  static getDirection(from, target) {
    if (from > target) return -1;
    else if (from < target) return 1;

    return 0;
  }
  static isCandyInTarget(candy) {
    return (
      Number(candy.x) === Number(candy.targetX) &&
      Number(candy.y) === Number(candy.targetY)
    );
  }
  static lerp(from, to, t) {
    return (1 - t) * from + t * to;
  }
  static smootherStep(t) {
    return Math.pow(t, 3) * (t * (t * 6 - 15) + 10);
  }
  static inBoundary(x, y, width, height) {
    return x >= 0 && x < width && y >= 0 && y < height;
  }
  static largest(array) {
    return Math.max(...array);
  }
  static smallest(array) {
    return Math.min(...array);
  }
  static async loadImage(path) {
    return new Promise((resolve) => {
      const image = new Image();
      image.src = path;

      image.addEventListener("load", () => resolve(image));
    });
  }
}

export default Utility;
