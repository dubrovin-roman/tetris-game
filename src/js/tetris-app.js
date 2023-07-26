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

// отрисовка чистого игрового поля fullscreen с id на html
function createPlayingFieldFS(fieldFS) {
  fieldFS.innerHTML = "";
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      const tempElem = `<div id="pfFS-${row}-${col}" class="playing-field-fs__cell"></div>`;
      fieldFS.insertAdjacentHTML("beforeend", tempElem);
    }
  }
}

const fieldFS = document.querySelector(".container-fs__playing-field-fs");
createPlayingFieldFS(fieldFS);

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
  body: document.querySelector("body"),
  container: document.querySelector(".container"),
  containerFS: document.querySelector(".container-fs"),
  playingFieldCells: document.querySelectorAll(".playing-field__cell"),
  playingFieldFSCells: document.querySelectorAll(".playing-field-fs__cell"),
  levelDisplay: document.querySelector("#level-display"),
  scoreDisplay: document.querySelector("#score-display"),
  linesDisplay: document.querySelector("#lines-display"),
  timeDisplay: document.querySelector("#time-display"),
  speedDisplay: document.querySelector("#speed-display"),
  nextBrickFieldCells: document.querySelectorAll(".next-brick-field__cell"),
  btnBox: document.querySelector(".playing-content__btn-box"),
  btnNewGame: document.querySelector("#btn-new-game"),
  btnPause: document.querySelector("#btn-pause"),
  btnReset: document.querySelector("#btn-reset"),
  btnDonate: document.querySelector("#btn-donate"),
  modal: document.querySelector("#modal-game-over"),
  modalPaused: document.querySelector("#modal-pause"),
  modalDonate: document.querySelector("#modal-donate"),
  overlay: document.querySelector(".overlay"),
  btnsCloseModal: document.querySelectorAll(".btn--close-modal"),
  scoreDisplayModal: document.querySelector("#score-display-modal"),
  btnNewGameModal: document.querySelector("#btn-new-game-modal"),
  toggleMusic: document.querySelector("#toggle-music"),
  toggleFreezeSpeed: document.querySelector("#toggle-freeze-speed"),
  toggleColorMode: document.querySelector("#toggle-color-mode"),
  btnsSpeedBox: document.querySelector(".playing-content__btns-speed-box"),
  btnsLeft: document.querySelectorAll(".btn-left"),
  btnsRight: document.querySelectorAll(".btn-right"),
  btnsDown: document.querySelectorAll(".btn-down"),
  btnRotate: document.querySelector(".container__btn-rotate"),
  btnDoubleDown: document.querySelector(".container__double-down"),
  btnFullScreen: document.querySelector(".container__btn-full-screen"),
  btnFullScreenExit: document.querySelector(
    ".container-fs__btn-fullscreen-exit"
  ),
};

// при загрузке страница переключатели не активны
page.toggleMusic.disabled = true;
page.toggleFreezeSpeed.disabled = true;
//page.toggleColorMode.disabled = true;
// скрываем кнопки изменения скорости
page.btnsSpeedBox.classList.add("btns-speed_hidden");

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
  page.scoreDisplayModal,
  page.speedDisplay,
  page.modalPaused,
  page.modalDonate,
  page.playingFieldFSCells
);

// отключил контекстное меню
document.body.oncontextmenu = function (ev) {
  return false;
};

// закрытие модального окна
const closeModal = function () {
  if (!page.modal.classList.contains("hidden")) {
    page.modal.classList.add("hidden");
  }

  if (!page.modalDonate.classList.contains("hidden")) {
    page.modalDonate.classList.add("hidden");
    if (tetris.isPause) tetris.pause();
  }

  if (!page.modalPaused.classList.contains("hidden")) {
    page.modalPaused.classList.add("hidden");
    if (tetris.isPause) tetris.pause();
  }
  page.overlay.classList.add("hidden");
};

page.btnsCloseModal.forEach((elem) =>
  elem.addEventListener("click", closeModal)
);
page.overlay.addEventListener("click", closeModal);

// действие при нажатии на клавиатуре
document.addEventListener("keydown", (e) => {
  // кнопка escape привключенной паузе
  if (e.key === "Escape") {
    closeModal();
  }

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

// действие при нажатии кнопки действия rotate
page.btnRotate.addEventListener("click", (ev) => {
  ev.preventDefault();
  tetris.arrowUp();
});

// действие при нажатии кнопок left
page.btnsLeft.forEach((elem) => {
  elem.addEventListener("click", (ev) => {
    ev.preventDefault();
    tetris.arrowLeft();
  });
});

// действие при нажатии кнопок right
page.btnsRight.forEach((elem) => {
  elem.addEventListener("click", (ev) => {
    ev.preventDefault();
    tetris.arrowRight();
  });
});

// действие при нажатии кнопок down
page.btnsDown.forEach((elem) => {
  elem.addEventListener("click", (ev) => {
    ev.preventDefault();
    tetris.arrowDown();
  });
});

// действие при нажатии кнопки действия double down
page.btnDoubleDown.addEventListener("click", (ev) => {
  ev.preventDefault();
  tetris.isDblDownPress = true;
  const tId = setInterval(() => {
    if (!tetris.isDblDownPress) clearInterval(tId);
    tetris.arrowDown();
  }, 100);
});

// действие при нажатии кнопки full screen
page.btnFullScreen.addEventListener("click", (ev) => {
  ev.preventDefault();
  if (!tetris.isColorMod) toggleColorMode();
  if (!page.container.hasAttribute("style"))
    page.container.setAttribute("style", "display: none");
  if (page.containerFS.hasAttribute("style"))
    page.containerFS.removeAttribute("style");

  page.body.classList.add("body-fs");
  if (tetris.isColorMod) page.body.classList.add("body-fs_color-mode");
});

// действие при нажатии кнопки fullscreen exit
page.btnFullScreenExit.addEventListener("click", (ev) => {
  ev.preventDefault();
  if (page.container.hasAttribute("style"))
    page.container.removeAttribute("style");
  if (!page.containerFS.hasAttribute("style"))
    page.containerFS.setAttribute("style", "display: none");

  page.body.classList.remove("body-fs");
  page.body.classList.remove("body-fs_color-mode");
});

// кнопка новой игры в модальном окне
page.btnNewGameModal.addEventListener("click", () => {
  // если игра запущена нажатие на кнопку не сработает
  if (!tetris.gameOver) {
    return;
  }

  page.toggleFreezeSpeed.checked = false;
  if (tetris.isSpeedFrozen) tetris.toggleFreezeSpeed();

  // скрываем кнопки изменения скорости
  page.btnsSpeedBox.classList.add("btns-speed_hidden");

  tetris.hideModal();
  tetris.init();
  // сбрасываем время песнина 0
  mainTheme.currentTime = 0;
});

// функция для переключателя музыки
function togglePlay() {
  if (mainTheme.paused) mainTheme.play();
  else mainTheme.pause();
}

// функция скрытия и показа кнопок изменения скорости
function toggleSpeedBtns(checked) {
  if (checked) {
    page.btnsSpeedBox.classList.remove(
      "btns-speed_animationLeftToRight",
      "btns-speed_hidden"
    );
  } else {
    page.btnsSpeedBox.classList.add("btns-speed_animationLeftToRight");
    setTimeout(() => page.btnsSpeedBox.classList.add("btns-speed_hidden"), 900);
  }
}

// функция преключения color mode для игрового поля и поля следующей фигуры
function toggleFieldsColorMode() {
  playingField.classList.toggle("playing-field_color-mode");
  fieldFS.classList.toggle("playing-field-fs_color-mode");
  nbf.classList.toggle("next-brick-field_color-mode");
}

// переключатель музыка
page.toggleMusic.addEventListener("change", function () {
  togglePlay();
});

// переключатель заморозки скорости
page.toggleFreezeSpeed.addEventListener("change", function () {
  tetris.toggleFreezeSpeed();
  toggleSpeedBtns(page.toggleFreezeSpeed.checked);
});

// переключатель color mode
page.toggleColorMode.addEventListener("change", function () {
  toggleColorMode();
});

// функция для переключателя color mode
function toggleColorMode() {
  if (!page.toggleColorMode.checked) page.toggleColorMode.checked = true;
  tetris.toggleColorMode();
  toggleFieldsColorMode();
}

// кнопки изменения скорости
page.btnsSpeedBox.addEventListener("click", (ev) => {
  ev.preventDefault();

  // кнопка минус
  if (ev.target.closest("#btn-minus-speed")) {
    tetris.speedUp();
  }

  // кнопка плюс
  if (ev.target.closest("#btn-plus-speed")) {
    tetris.speedDown();
  }
});

// кнопки главного меню
page.btnBox.addEventListener("click", (ev) => {
  ev.preventDefault();

  if (ev.target.classList.contains("btn-main-menu")) {
    // кнопка сброса
    if (ev.target.id == "btn-reset") {
      if (!mainTheme.paused) mainTheme.pause();

      page.toggleMusic.disabled = true;
      page.toggleFreezeSpeed.disabled = true;

      page.toggleMusic.checked = true;
      page.toggleFreezeSpeed.checked = false;
      tetris.isColorMod
        ? (page.toggleColorMode.checked = true)
        : (page.toggleColorMode.checked = false);
      if (tetris.isSpeedFrozen) tetris.toggleFreezeSpeed();
      toggleSpeedBtns(page.toggleFreezeSpeed.checked);
      //if (tetris.isColorMod) tetris.toggleColorMode();

      tetris.reset();
    }
    // кнопка паузы
    if (ev.target.id == "btn-pause") {
      // если игра не запущена кнопка не сработает
      if (tetris.gameOver) return;

      if (!mainTheme.paused) {
        togglePlay();
        if (page.toggleMusic.checked) page.toggleMusic.checked = false;
        else page.toggleMusic.checked = true;
      }

      tetris.pause();
      tetris.showPauseModal();
    }
    // кнопка новой игры
    if (ev.target.id == "btn-new-game") {
      if (!tetris.gameOver) return;

      page.toggleMusic.disabled = false;
      page.toggleFreezeSpeed.disabled = false;
      page.toggleColorMode.disabled = false;

      page.toggleMusic.checked = true;
      page.toggleFreezeSpeed.checked = false;
      tetris.isColorMod
        ? (page.toggleColorMode.checked = true)
        : (page.toggleColorMode.checked = false);
      if (tetris.isSpeedFrozen) tetris.toggleFreezeSpeed();
      //if (tetris.isColorMod) tetris.toggleColorMode();

      tetris.init();
      // сбрасываем время песнина 0
      mainTheme.currentTime = 0;
      mainTheme.play();
    }

    // кнопка donate
    if (ev.target.id == "btn-donate") {
      if (!tetris.gameOver) {
        if (!tetris.isPause) {
          if (!mainTheme.paused) {
            togglePlay();
            if (page.toggleMusic.checked) page.toggleMusic.checked = false;
            else page.toggleMusic.checked = true;
          }
          tetris.pause();
        }
      }
      tetris.showDonateModal();
    }
  }
});
