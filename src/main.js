import "../style.css";
import Game from "./Game";

const buttonStart = document.querySelector("#btn-start");
const logoElement = document.querySelector("#logo");
const canvas = document.querySelector("#canvas");
const starterWrapper = document.querySelector(".starter-wrapper");

const game = new Game({ canvas });

const startHandler = async () => {
  await Promise.all([
    animate(logoElement, ["scale-out"]),
    animate(buttonStart, ["fade-out"]),
  ]);
  logoElement.style.visibility = "hidden";
  buttonStart.style.visibility = "hidden";

  await animate(starterWrapper, ["active"]);
  // starterWrapper.style.top = "15%";

  canvas.style.visibility = "visible";
  await animate(canvas, ["show"]);

  await game.init();
};

buttonStart.addEventListener("click", startHandler);

const animate = (element, classList) => {
  return new Promise((resolve) => {
    const classes = ["animate", ...classList];

    element.classList.add(...classes);

    const animationCallback = () => {
      // element.classList.remove(...classes);
      element.removeEventListener("transitionend", animationCallback);
      return resolve();
    };

    element.addEventListener("transitionend", animationCallback);
  });
};
