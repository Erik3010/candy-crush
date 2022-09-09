import "../style.css";
import Game from "./Game";

const buttonStart = document.querySelector("#btn-start");
const logoElement = document.querySelector("#logo");
const canvas = document.querySelector("#canvas");

const game = new Game({ canvas });
game.init();

buttonStart.addEventListener("click", () => {
  animate({
    element: buttonStart,
    animationClass: ["fade-out", "scale-out"],
    type: "transition",
  });
  // animate({
  //   element: logoElement,
  //   animationClass: ["fade-out", "scale-out"],
  //   type: "transition",
  // });

  animate({
    element: canvas,
    animationClass: ["fade-in", "scale-in"],
    type: "transition",
    animationType: "in",
  });
});

const animate = ({
  element,
  animationClass,
  type = "animation",
  animationType = "out",
}) => {
  const classes = ["animate", ...animationClass];

  if (animationType === "in") element.classList.remove("hide");

  element.classList.add(...classes);

  const animationCallback = () => {
    if (animationType === "out") {
      element.classList.remove(...classes);
      element.classList.add("hide");
    }

    element.removeEventListener(`${type}end`, animationCallback);
  };
  element.addEventListener(`${type}end`, animationCallback);
};
