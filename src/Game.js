import Candy from "./Candy";
import Utility from "./Utility";
import { SPRITE_IMAGE_PATH } from "./constant";

import { DIRECTIONS } from "./constant";

class Game {
  constructor({ canvas }) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    this.size = 9;
    this.candyTypeCount = 5;

    this.cellWidth = this.canvas.width / this.size;

    this.candies = Array(this.size)
      .fill([])
      .map(() => Array(this.size).fill(null));

    this.selectedCandyCoordinate = {
      first: null,
      second: null,
    };

    this.isSwapBack = false;

    this.animating = false;

    this.animationJobs = [];
    this.newCandies = [];

    this.candyImage = null;
  }
  async init() {
    this.candyImage = await Utility.loadImage(SPRITE_IMAGE_PATH);

    this.candies.forEach((candies, row) =>
      candies.forEach((_, col) => {
        this.candies[row][col] = this.createCandyInstance({
          type: Utility.random(0, this.candyTypeCount),
          coordinate: {
            y: row,
            x: col,
          },
        });
      })
    );

    this.bindEventListener();
    this.swapDestroyableCandy();

    this.render();
  }
  bindEventListener() {
    this.canvas.addEventListener("click", ({ offsetY, offsetX }) => {
      if (this.isAnimating) return;

      const { y, x } = {
        x: Math.floor(offsetX / this.cellWidth),
        y: Math.floor(offsetY / this.cellWidth),
      };

      this.clickHandler({ y, x });
    });
  }
  async clickHandler({ y, x }) {
    const candy = this.candies[y][x];

    if (candy.selected) return;

    if (!this.selectedCandyCoordinate.first) {
      this.selectedCandyCoordinate.first = { y, x };
      candy.selected = true;
      return;
    }

    const { y: prevY, x: prevX } = this.selectedCandyCoordinate.first;
    if (!Utility.isAround(this.selectedCandyCoordinate.first, { y, x })) {
      this.selectedCandyCoordinate.first = null;
      this.candies[prevY][prevX].selected = false;
      return;
    }

    this.selectedCandyCoordinate.second = { y, x };
    this.candies[prevY][prevX].selected = false;

    await this.swapCandyPosition(
      this.selectedCandyCoordinate.first,
      this.selectedCandyCoordinate.second
    );

    this.selectedCandyCoordinate = { first: null, second: null };
  }
  async swapCandyPosition(first, second) {
    const firstCandy = this.candies[first.y][first.x];
    const secondCandy = this.candies[second.y][second.x];

    firstCandy.updateTarget({
      targetY: secondCandy.y,
      targetX: secondCandy.x,
    });

    secondCandy.updateTarget({
      targetY: firstCandy.y,
      targetX: firstCandy.x,
    });

    this.isAnimating = true;
    await Promise.all([
      firstCandy.movePositionToTarget(),
      secondCandy.movePositionToTarget(),
    ]);

    const tempCandy = this.candies[first.y][first.x];
    this.candies[first.y][first.x] = this.createCandyInstance({
      ...secondCandy,
      coordinate: { y: first.y, x: first.x },
    });
    this.candies[second.y][second.x] = this.createCandyInstance({
      ...tempCandy,
      coordinate: { y: second.y, x: second.x },
    });

    this.isAnimating = false;

    if (this.isSwapBack) {
      this.isSwapBack = false;
      return;
    }

    const destroyableCandies = this.checkDestroyableCandy();
    if (!destroyableCandies.length) {
      this.isSwapBack = true;
      await this.swapCandyPosition(first, second);
      return;
    }

    await this.destroyCandy(destroyableCandies);
  }
  checkDestroyableCandy() {
    const destroyableCandies = [];

    for (const [row, candies] of this.candies.entries()) {
      for (const [col, candy] of candies.entries()) {
        if (candy.destroyable) continue;

        const coordinates = this.traverseCandy(candy);
        coordinates.length > 0 && destroyableCandies.push(coordinates);
      }
    }

    return destroyableCandies;
  }
  traverseCandy(candy) {
    const coordinates = [];

    for (const [dirY, dirX] of DIRECTIONS) {
      if (!this.isDestroyableCandy(candy, [dirY, dirX])) continue;

      const [y, x] = [candy.coordinate.y, candy.coordinate.x];

      let tempY = y;
      let tempX = x;

      while (
        Utility.inBoundary(tempY, tempX, this.size, this.size) &&
        this.candies[tempY][tempX].type === candy.type
      ) {
        this.candies[tempY][tempX].destroyable = true;

        coordinates.push([tempY, tempX]);

        tempY += dirY;
        tempX += dirX;
      }
    }

    return coordinates;
  }
  isDestroyableCandy(candy, [dirY, dirX]) {
    const [y, x] = [candy.coordinate.y, candy.coordinate.x];

    const [nextY, nextX] = [y + dirY, x + dirX];
    const [afterNextY, afterNextX] = [y + dirY + dirY, x + dirX + dirX];

    return (
      Utility.inBoundary(nextX, nextY, this.size, this.size) &&
      Utility.inBoundary(afterNextX, afterNextY, this.size, this.size) &&
      this.candies[nextY][nextX].type === candy.type &&
      this.candies[afterNextY][afterNextX].type === candy.type
    );
  }
  swapDestroyableCandy() {
    while (true) {
      const destroyableCandies = this.checkDestroyableCandy();
      if (!destroyableCandies.length) return;

      for (const coordinates of destroyableCandies) {
        const availableCandyTypes = [
          ...Array(this.candyTypeCount + 1).keys(),
        ].slice(1);

        for (const [dirY, dirX] of DIRECTIONS) {
          const randomCandyIndex = Utility.random(0, coordinates.length - 1);
          const [y, x] = coordinates[randomCandyIndex];

          const [nextY, nextX] = [y + dirY, x + dirX];
          if (!Utility.inBoundary(nextX, nextY, this.size, this.size)) continue;

          const candy = this.candies[nextY][nextX];
          const candyTypeIndex = availableCandyTypes.indexOf(candy.type);

          if (candyTypeIndex !== -1) {
            availableCandyTypes.splice(candyTypeIndex, 1);
          }

          const randomCandyType = Utility.random(0, availableCandyTypes.length);
          this.candies[y][x].type = randomCandyType;
        }

        this.removeCandiesDestroyable(coordinates);
      }
    }
  }
  async destroyCandy(destroyableCandies) {
    this.isAnimating = true;

    const coordinates = destroyableCandies[0];
    // for (const coordinates of destroyableCandies) {
    const yAxis = coordinates.map(([y]) => y);
    const xAxis = coordinates.map(([, x]) => x);

    const startY = Utility.smallest(yAxis);
    const endY = Utility.largest(yAxis);
    const startX = Utility.smallest(xAxis);
    const endX = Utility.largest(xAxis);

    const destroyedRowCount = endY - startY + 1;
    const destroyedColumnCount = endX - startX + 1;

    this.markCandyAsDestroyed(coordinates);

    for (let x = startX; x < startX + destroyedColumnCount; x++) {
      this.slideDownCandy({ x, y: startY }, destroyedRowCount);
      this.fillEmptyPosition({ x, y: destroyedRowCount });
    }
    // }

    await Promise.all(
      this.newCandies
        .filter(({ isDestroyCandy }) => isDestroyCandy === true)
        .map(({ candy }) => candy.animateScaleDown())
    );

    await this.animateDestroyedCandies();
    this.newCandies = [];

    for (const coords of destroyableCandies) {
      this.removeCandiesDestroyable(coords);
    }

    // check is there any destroyable candy
    const newDestroyableCandies = this.checkDestroyableCandy();
    if (newDestroyableCandies.length) {
      await this.destroyCandy(newDestroyableCandies);
    }

    this.isAnimating = false;
  }
  async animateDestroyedCandies() {
    const destroyedCandy = this.newCandies.filter(
      ({ isDestroyCandy }) => !isDestroyCandy
    );

    destroyedCandy.forEach(({ y, x, candy }) => (this.candies[y][x] = candy));

    await Promise.all(
      destroyedCandy.map(({ candy }) => candy.movePositionToTarget())
    );
  }
  markCandyAsDestroyed(coordinates) {
    for (const [y, x] of coordinates) {
      this.newCandies.push({
        x,
        y,
        isDestroyCandy: true,
        candy: this.candies[y][x],
      });
    }
  }
  slideDownCandy(initial, destroyedRowCount) {
    for (let y = initial.y - 1; y >= 0; y--) {
      const candy = this.candies[y][initial.x];

      this.newCandies.push({
        x: initial.x,
        y: y + destroyedRowCount,
        isDestroyCandy: false,
        candy: this.createCandyInstance({
          ...this.candies[y + destroyedRowCount][initial.x],
          x: candy.x,
          y: candy.y,
          type: candy.type,
          targetY: candy.y + destroyedRowCount * this.cellWidth,
        }),
      });
    }
  }
  fillEmptyPosition(initial) {
    for (let y = initial.y - 1; y >= 0; y--) {
      this.newCandies.push({
        y,
        x: initial.x,
        isDestroyCandy: false,
        candy: this.createCandyInstance({
          coordinate: { y, x: initial.x },
          y: (y - initial.y) * this.cellWidth,
          targetY: y * this.cellWidth,
          type: Utility.random(0, this.candyTypeCount),
        }),
      });
    }
  }
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.draw();

    // this.runAnimationJobs();

    setTimeout(this.render.bind(this), 10);
  }
  draw() {
    this.candies.forEach((candy) => candy.forEach((c) => c.draw()));
  }
  createCandyInstance(options) {
    return new Candy({
      ctx: this.ctx,
      width: this.cellWidth,
      image: this.candyImage,
      ...options,
    });
  }
  removeCandiesDestroyable(coordinates) {
    for (const [y, x] of coordinates) {
      this.candies[y][x].destroyable = false;
    }
  }
  /**
   * @deprecated
   */
  runAnimationJobs() {
    this.animationJobs.forEach(({ interpolation, initial, candy }, index) => {
      if (!Utility.isCandyInTarget(candy)) {
        const fraction = Utility.smootherStep(interpolation);
        const x = Utility.lerp(candy.x, candy.targetX, fraction).toFixed(7);
        const y = Utility.lerp(candy.y, candy.targetY, fraction).toFixed(7);

        candy.movePosition({ x, y });

        this.animationJobs[index].interpolation += 0.01;
      } else {
        this.animationJobs.splice(index, 1);
      }
    });
  }
  /**
   * @deprecated
   */
  addAnimationToCandy(candy) {
    const initial = { y: candy.y, x: candy.x };

    this.animationJobs.push({
      initial,
      candy,
      interpolation: 0,
    });
  }
  /**
   * @deprecated
   */
  async animateSwapV2(first, second) {
    const firstCandy = this.candies[first.y][first.x];
    const secondCandy = this.candies[second.y][second.x];

    this.addAnimationToCandy(firstCandy);
    this.addAnimationToCandy(secondCandy);
  }
}

export default Game;
