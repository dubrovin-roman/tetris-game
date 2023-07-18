"use strict";

import { TetrisApp } from "./TetrisAppClass.js";

// отрисовка чистого игрового поля с id на html
function createPlayingField(playingField) {
  playingField.innerHTML = "";
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      const tempElem = `<div id="pf-${row}-${col}" class="playing-field__cell"></div>`;
      playingField.insertAdjacentHTML("beforeend", tempElem);
    }
  }
}

const playingField = document.querySelector(".container__playing-field");
createPlayingField(playingField);

// отрисовка чистого поля для следующей фигуры с id на html
function createNextBrickField(nextBrickField) {
  nextBrickField.innerHTML = "";
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const tempElem = `<div id="nbf-${row}-${col}" class="next-brick-field__cell"></div>`;
      nextBrickField.insertAdjacentHTML("beforeend", tempElem);
    }
  }
}

const nbf = document.querySelector(".playing-content__next-brick");
createNextBrickField(nbf);

// элементы на странице
const page = {
  playingFieldCells: document.querySelectorAll(".playing-field__cell"),
  levelDisplay: document.querySelector("#level-display"),
  scoreDisplay: document.querySelector("#score-display"),
  linesDisplay: document.querySelector("#lines-display"),
  timeDisplay: document.querySelector("#time-display"),
  nextBrickFieldCells: document.querySelectorAll(".next-brick-field__cell"),
  btnNewGame: document.querySelector("#btn-new-game"),
  btnPause: document.querySelector("#btn-pause"),
  btnSettings: document.querySelector("#btn-settings"),
  btnReset: document.querySelector("#btn-reset"),
  modal: document.querySelector(".modal"),
  overlay: document.querySelector(".overlay"),
  btnCloseModal: document.querySelector(".btn--close-modal"),
  scoreDisplayModal: document.querySelector("#score-display-modal"),
  btnNewGameModal: document.querySelector("#btn-new-game-modal"),
};

// закрытие модального окна
const closeModal = function () {
  page.modal.classList.add("hidden");
  page.overlay.classList.add("hidden");
};

page.btnCloseModal.addEventListener("click", closeModal);
page.overlay.addEventListener("click", closeModal);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

// создаем объект тетриса
const tetris = new TetrisApp(
  page.playingFieldCells,
  page.nextBrickFieldCells,
  page.levelDisplay,
  page.scoreDisplay,
  page.linesDisplay,
  page.timeDisplay,
  page.modal,
  page.overlay,
  page.scoreDisplayModal
);

// действие при нажатии на клавиатуре кнопки вверх
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    tetris.arrowUp();
  }
});

// действие при нажатии на клавиатуре кнопки вправо
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    tetris.arrowRight();
  }
});

// действие при нажатии на клавиатуре кнопки влево
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") {
    tetris.arrowLeft();
  }
});

// действие при нажатии на клавиатуре кнопки вниз
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    tetris.arrowDown();
  }
});

// кнопка новой игры
page.btnNewGame.addEventListener("click", () => {
  // если игра запущена нажатие на кнопку не сработает
  if (!tetris.gameOver) {
    return;
  }

  tetris.init();
});

// кнопка новой игры в модальном окне
page.btnNewGameModal.addEventListener("click", () => {
  // если игра запущена нажатие на кнопку не сработает
  if (!tetris.gameOver) {
    return;
  }

  tetris.hideModal();
  tetris.init();
});

// кнопка паузы
page.btnPause.addEventListener("click", () => {
  // если игра не запущена кнопка не сработает
  if (tetris.gameOver) {
    return;
  }

  tetris.pause();
});

// кнопка сброса
page.btnReset.addEventListener("click", () => {
  tetris.reset();
});