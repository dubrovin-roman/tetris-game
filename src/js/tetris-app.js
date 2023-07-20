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

// подгружаем аудио файл главной темы Тетрис
const mainTheme = new Audio("../sound/soundtrack-tetris.mp3");

// зацикливаем аудио файл главной темы Тетрис
mainTheme.addEventListener(
  "ended",
  function () {
    this.currentTime = 0;
    this.play();
  },
  false
);

// элементы на странице
const page = {
  playingFieldCells: document.querySelectorAll(".playing-field__cell"),
  levelDisplay: document.querySelector("#level-display"),
  scoreDisplay: document.querySelector("#score-display"),
  linesDisplay: document.querySelector("#lines-display"),
  timeDisplay: document.querySelector("#time-display"),
  nextBrickFieldCells: document.querySelectorAll(".next-brick-field__cell"),
  btnBox: document.querySelector(".playing-content__btn-box"),
  btnNewGame: document.querySelector("#btn-new-game"),
  btnPause: document.querySelector("#btn-pause"),
  btnSettings: document.querySelector("#btn-settings"),
  btnReset: document.querySelector("#btn-reset"),
  modal: document.querySelector(".modal"),
  overlay: document.querySelector(".overlay"),
  btnCloseModal: document.querySelector(".btn--close-modal"),
  scoreDisplayModal: document.querySelector("#score-display-modal"),
  btnNewGameModal: document.querySelector("#btn-new-game-modal"),
  toggleMusic: document.querySelector(".toggle-music"),
};
console.dir(page.toggleMusic);

// закрытие модального окна
const closeModal = function () {
  page.modal.classList.add("hidden");
  page.overlay.classList.add("hidden");
};

page.btnCloseModal.addEventListener("click", closeModal);
page.overlay.addEventListener("click", closeModal);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !page.modal.classList.contains("hidden")) {
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

// действие при нажатии на клавиатуре
document.addEventListener("keydown", (e) => {
  // если пауза клавиша не работает
  if (tetris.isPause) return;
  // кнопки вправо
  if (e.key === "ArrowRight") {
    tetris.arrowRight();
  }
  // кнопки влево
  if (e.key === "ArrowLeft") {
    tetris.arrowLeft();
  }
  // кнопки вниз
  if (e.key === "ArrowDown") {
    tetris.arrowDown();
  }
  // кнопки вверх
  if (e.key === "ArrowUp") {
    tetris.arrowUp();
  }
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

// функция для переключателя музыки
function togglePlay() {
  if (mainTheme.paused) mainTheme.play();
  else mainTheme.pause();
}

// переключатель музыка
page.toggleMusic.addEventListener("change", function () {
  togglePlay();
});

// кнопки главного меню
page.btnBox.addEventListener("click", (ev) => {
  ev.preventDefault();

  if (ev.target.classList.contains("btn-main-menu")) {
    // кнопка сброса
    if (ev.target.id == "btn-reset") {
      if (!mainTheme.paused) mainTheme.pause();

      page.toggleMusic.disabled = false;
      page.toggleMusic.checked = true;
      tetris.reset();
    }
    // кнопка паузы
    if (ev.target.id == "btn-pause") {
      // если игра не запущена кнопка не сработает
      if (tetris.gameOver) return;
      // переключение активности переключателя музыки при нажатии паузы
      if (page.toggleMusic.disabled) page.toggleMusic.disabled = false;
      else page.toggleMusic.disabled = true;

      if (!mainTheme.paused) {
        togglePlay();
        if (page.toggleMusic.checked) page.toggleMusic.checked = false;
        else page.toggleMusic.checked = true;
      }

      tetris.pause();
    }
    // кнопка новой игры
    if (ev.target.id == "btn-new-game") {
      if (!tetris.gameOver) return;

      page.toggleMusic.disabled = false;
      page.toggleMusic.checked = true;

      tetris.init();
      mainTheme.play();
    }
  }
});
