"use strict";

const tetrominos = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const colors = {
  I: "cyan",
  O: "yellow",
  T: "purple",
  S: "green",
  Z: "red",
  J: "blue",
  L: "orange",
};

class TetrisApp {
  playField = [];
  tetrominoSequence = [];
  level = 0;
  score = 0;
  lines = 0;
  time = 0;
  speed = 1000;
  gameOver = true;
  nextBrick;
  intervalSpeedId;
  intervalTimeId;
  isPause = false;
  isReset = false;
  isSpeedFrozen = false;
  isColorMod = false;
  isDblDownPress = false;

  constructor(
    playingFieldCells,
    nextBrickFieldCells,
    levelDisplay,
    scoreDisplay,
    linesDisplay,
    timeDisplay,
    modal,
    overlay,
    scoreDisplayModal,
    speedDisplay,
    modalPause,
    modaleDonate,
    playingFieldFSCells
  ) {
    // заполняем сразу массив пустыми ячейками
    for (let row = -2; row < 20; row++) {
      this.playField[row] = [];

      for (let col = 0; col < 10; col++) {
        this.playField[row][col] = 0;
      }
    }
    this.playingFieldCells = Array.from(playingFieldCells);
    this.nextBrickFieldCells = Array.from(nextBrickFieldCells);
    this.playingFieldFSCells = Array.from(playingFieldFSCells);
    this.scoreDisplay = scoreDisplay;
    this.linesDisplay = linesDisplay;
    this.levelDisplay = levelDisplay;
    this.timeDisplay = timeDisplay;
    this.speedDisplay = speedDisplay;
    this.modal = modal;
    this.modalPause = modalPause;
    this.modaleDonate = modaleDonate;
    this.overlay = overlay;
    this.scoreDisplayModal = scoreDisplayModal;
    this.tetromino = this._getNextTetromino();
  }

  _renderingPlayingField() {
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        const tempElem = this.playingFieldCells.find(
          (elem) => elem.id == `pf-${row}-${col}`
        );
        const tempElemFS = this.playingFieldFSCells.find(
          (elem) => elem.id == `pfFS-${row}-${col}`
        );
        if (this.playField[row][col] != 0) {
          this.isColorMod
            ? tempElem.classList.add(
                `active-cell_${colors[`${this.playField[row][col]}`]}`
              )
            : tempElem.classList.add("active-cell");
          this.isColorMod
            ? tempElemFS.classList.add(
                `active-cell-fs_${colors[`${this.playField[row][col]}`]}`
              )
            : tempElemFS.classList.add("active-cell-fs");
        } else if (this.playField[row][col] == 0) {
          tempElem.removeAttribute("class");
          tempElem.setAttribute("class", "playing-field__cell");
          tempElemFS.removeAttribute("class");
          tempElemFS.setAttribute("class", "playing-field-fs__cell");
        }
      }
    }
  }

  // создаём последовательность фигур, которая появится в игре
  _generateSequence() {
    // тут — сами фигуры
    const sequence = ["I", "J", "L", "O", "S", "T", "Z"];

    while (sequence.length) {
      // случайным образом находим любую из них
      const rand = this._getRandomInt(0, sequence.length - 1);
      const name = sequence.splice(rand, 1)[0];
      // помещаем выбранную фигуру в игровой массив с последовательностями
      this.tetrominoSequence.push(name);
    }
  }

  _getPoints(level, lines) {
    let points = 0;
    if (this.isSpeedFrozen) return points;
    if (lines >= 4) {
      if (level == 0) return 1200;
      points = 1200 * (level + 1);
    }
    if (lines == 3) {
      if (level == 0) return 300;
      points = 300 * (level + 1);
    }
    if (lines == 2) {
      if (level == 0) return 100;
      points = 100 * (level + 1);
    }
    if (lines == 1) {
      if (level == 0) return 40;
      points = 40 * (level + 1);
    }
    return points;
  }

  // получаем следующую фигуру
  _getNextTetromino() {
    // если следующей нет — генерируем
    if (this.tetrominoSequence.length === 0) {
      this._generateSequence();
    }
    // берём первую фигуру из массива
    const name = this.tetrominoSequence.shift();
    // сразу создаём матрицу, с которой мы отрисуем фигуру
    const matrix = tetrominos[name];

    // I и O стартуют с середины, остальные — чуть левее
    const col = this.playField[0].length / 2 - Math.ceil(matrix[0].length / 2);

    // I начинает с 21 строки (смещение -1), а все остальные — со строки 22 (смещение -2)
    const row = name === "I" ? -1 : -2;

    // получаем фигуру для поля nextBrick
    this.nextBrick = this._getNexBrick();

    // вот что возвращает функция
    return {
      name: name, // название фигуры (L, O, и т.д.)
      matrix: matrix, // матрица с фигурой
      row: row, // текущая строка (фигуры стартуют за видимой областью холста)
      col: col, // текущий столбец
    };
  }

  // получаем фигуру для следующего хода
  _getNexBrick() {
    // если следующей нет — генерируем
    if (this.tetrominoSequence.length === 0) {
      this._generateSequence();
    }
    const name = this.tetrominoSequence[0];
    const matrix = tetrominos[name];
    // I и O стартуют с середины, остальные — чуть левее
    const col = 4 / 2 - Math.ceil(matrix[0].length / 2);
    const row = name === "I" ? 0 : 1;
    return {
      name: name, // название фигуры (L, O, и т.д.)
      matrix: matrix, // матрица с фигурой
      row: row, // текущая строка (фигуры стартуют за видимой областью холста)
      col: col, // текущий столбец
    };
  }

  // утилитарные методы
  _getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // поворачиваем матрицу на 90 градусов
  _rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
      row.map((val, j) => matrix[N - j][i])
    );
    // на входе матрица, и на выходе тоже отдаём матрицу
    return result;
  }

  // проверяем после появления или вращения, может ли матрица (фигура) быть в этом месте поля или она вылезет за его границы
  _isValidMove(matrix, cellRow, cellCol) {
    // проверяем все строки и столбцы
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (
          matrix[row][col] &&
          // если выходит за границы поля…
          (cellCol + col < 0 ||
            cellCol + col >= this.playField[0].length ||
            cellRow + row >= this.playField.length ||
            // …или пересекается с другими фигурами
            this.playField[cellRow + row][cellCol + col])
        ) {
          // то возвращаем, что нет, так не пойдёт
          return false;
        }
      }
    }
    // а если мы дошли до этого момента и не закончили раньше — то всё в порядке
    return true;
  }

  // когда фигура окончательна встала на своё место
  _placeTetromino() {
    this.isDblDownPress = false;

    let tempLines = 0;
    // обрабатываем все строки и столбцы в игровом поле
    for (let row = 0; row < this.tetromino.matrix.length; row++) {
      for (let col = 0; col < this.tetromino.matrix[row].length; col++) {
        if (this.tetromino.matrix[row][col]) {
          // если край фигуры после установки вылезает за границы поля, то игра закончилась
          if (this.tetromino.row + row < 0) {
            return this._showGameOver();
          }
          // если всё в порядке, то записываем в массив игрового поля нашу фигуру
          this.playField[this.tetromino.row + row][this.tetromino.col + col] =
            this.tetromino.name;
          this._renderingPlayingField();
        }
      }
    }

    // проверяем, чтобы заполненные ряды очистились снизу вверх
    for (let row = this.playField.length - 1; row >= 0; ) {
      // если ряд заполнен
      if (this.playField[row].every((cell) => !!cell)) {
        // очищаем его и опускаем всё вниз на одну клетку
        tempLines++;
        for (let r = row; r >= 0; r--) {
          for (let c = 0; c < this.playField[r].length; c++) {
            this.playField[r][c] = this.playField[r - 1][c];
          }
        }
        this._renderingPlayingField();
      } else {
        // переходим к следующему ряду
        row--;
      }
    }
    // получаем следующую фигуру
    this.tetromino = this._getNextTetromino();

    // отрисоваваем nextBrick
    this._renderingNexBrick();

    // добавляем соженные линии и набранные очки за ход к общим
    if (tempLines != 0) {
      this.lines += tempLines;
      this.score += this._getPoints(this.level, tempLines);
      // устанавливаем новый уровень
      this._setLevel();
      // устанавливаем новую скорость
      this._setIntervalSpeed();
    }

    // отрисовываем level score lines
    this._renderingLevelScoreLines();
  }

  // показываем надпись Game Over
  _showGameOver() {
    this.gameOver = true;
    this.isReset = true;
    this.scoreDisplayModal.innerText = `${this.score}`;
    this.modal.classList.remove("hidden");
    this.overlay.classList.remove("hidden");
    // останавливаем время
    clearInterval(this.intervalTimeId);
  }

  // скрываем модальное окно
  hideModal() {
    this.modal.classList.add("hidden");
    this.overlay.classList.add("hidden");
  }

  // стрелка вверх — поворот
  arrowUp() {
    // если игра закончилась — сразу выходим
    if (this.gameOver) return;
    // поворачиваем фигуру на 90 градусов
    const matrix = this._rotate(this.tetromino.matrix);
    // если так ходить можно — запоминаем
    if (this._isValidMove(matrix, this.tetromino.row, this.tetromino.col)) {
      this.tetromino.matrix = matrix;
    }
    this._renderingPlayingField();
    this._renderingTetromino();
  }

  // стрелки вправо
  arrowRight() {
    // если игра закончилась — сразу выходим
    if (this.gameOver) return;
    // увеличиваем индекс в столбце
    const col = this.tetromino.col + 1;
    // если так ходить можно, то запоминаем текущее положение
    if (this._isValidMove(this.tetromino.matrix, this.tetromino.row, col)) {
      this.tetromino.col = col;
    }
    this._renderingPlayingField();
    this._renderingTetromino();
  }

  // стрелки влево
  arrowLeft() {
    // если игра закончилась — сразу выходим
    if (this.gameOver) return;
    // уменьшаем индекс в столбце
    const col = this.tetromino.col - 1;
    // если так ходить можно, то запоминаем текущее положение
    if (this._isValidMove(this.tetromino.matrix, this.tetromino.row, col)) {
      this.tetromino.col = col;
    }
    this._renderingPlayingField();
    this._renderingTetromino();
  }

  // стрелка вниз — ускорить падение
  arrowDown() {
    // если игра закончилась — сразу выходим
    if (this.gameOver) return;
    // смещаем фигуру на строку вниз
    const row = this.tetromino.row + 1;
    // если опускаться больше некуда — запоминаем новое положение
    if (!this._isValidMove(this.tetromino.matrix, row, this.tetromino.col)) {
      this.tetromino.row = row - 1;
      // ставим на место и смотрим на заполненные ряды
      this._placeTetromino();
      return;
    }
    // запоминаем строку, куда стала фигура
    this.tetromino.row = row;
    this._renderingPlayingField();
    this._renderingTetromino();
  }

  // условное движение фигуры
  _conditionalMovementTetromino() {
    if (this.tetromino) {
      this.tetromino.row++;
      // если движение закончилось — рисуем фигуру в поле и проверяем, можно ли удалить строки
      if (
        !this._isValidMove(
          this.tetromino.matrix,
          this.tetromino.row,
          this.tetromino.col
        )
      ) {
        this.tetromino.row--;
        this._placeTetromino();
      }
    }
  }

  // отрисовка фигуры
  _renderingTetromino() {
    for (let row = 0; row < this.tetromino.matrix.length; row++) {
      for (let col = 0; col < this.tetromino.matrix[row].length; col++) {
        if (this.tetromino.matrix[row][col]) {
          if (this.tetromino.row + row >= 0 && this.tetromino.col + col >= 0) {
            const tempElem = this.playingFieldCells.find(
              (elem) =>
                elem.id ==
                `pf-${this.tetromino.row + row}-${this.tetromino.col + col}`
            );
            const tempElemFS = this.playingFieldFSCells.find(
              (elem) =>
                elem.id ==
                `pfFS-${this.tetromino.row + row}-${this.tetromino.col + col}`
            );
            this.isColorMod
              ? tempElem.classList.add(
                  `active-cell_${colors[this.tetromino.name]}`
                )
              : tempElem.classList.add("active-cell");
            this.isColorMod
              ? tempElemFS.classList.add(
                  `active-cell-fs_${colors[this.tetromino.name]}`
                )
              : tempElemFS.classList.add("active-cell-fs");
          }
        }
      }
    }
  }

  // отрисовка фигуры в поле nextBrick
  _renderingNexBrick() {
    //очищаем поле
    this._clearNextBrickField();

    // если фигура undefined ни чего не делаем
    if (!this.nextBrick) return;
    //отрисовываем фигуру
    for (let row = 0; row < this.nextBrick.matrix.length; row++) {
      for (let col = 0; col < this.nextBrick.matrix[row].length; col++) {
        if (this.nextBrick.matrix[row][col]) {
          const tempElem = this.nextBrickFieldCells.find(
            (elem) =>
              elem.id ==
              `nbf-${this.nextBrick.row + row}-${this.nextBrick.col + col}`
          );
          this.isColorMod
            ? tempElem.classList.add(
                `active-cell_${colors[this.nextBrick.name]}`
              )
            : tempElem.classList.add("active-cell");
        }
      }
    }
  }

  // очистить поле следующей фигуры
  _clearNextBrickField() {
    this.nextBrickFieldCells.forEach((elem) => {
      elem.removeAttribute("class");
      elem.setAttribute("class", "next-brick-field__cell");
    });
  }

  // очистить поле игры
  _clearGameField() {
    this.playingFieldCells.forEach((elem) => {
      elem.removeAttribute("class");
      elem.setAttribute("class", "playing-field__cell");
    });
    this.playingFieldFSCells.forEach((elem) => {
      elem.removeAttribute("class");
      elem.setAttribute("class", "playing-field-fs__cell");
    });
  }

  // отрисовка уровня, общего счета, соженных линий
  _renderingLevelScoreLines() {
    this.levelDisplay.innerText = `${this.level}`;
    this.scoreDisplay.innerText = `${this.score}`;
    this.linesDisplay.innerText = `${this.lines}`;
    this._renderingSpeed();
  }
  // отрисовка скорости
  _renderingSpeed() {
    this.speedDisplay.innerText = `${(this.speed - 1000) * -1}`;
  }

  // отображения времени игры
  _showTimeOfGame() {
    if (this.intervalTimeId) {
      clearInterval(this.intervalTimeId);
    }
    let timeDisp;
    this.intervalTimeId = setInterval(() => {
      if (this.time < 60) {
        timeDisp = `${this.time} sec`;
      } else {
        timeDisp = `${Math.trunc(this.time / 60)} min ${this.time % 60} sec`;
      }
      this.timeDisplay.innerText = `${timeDisp}`;
      this.time++;
      if (this.gameOver) clearInterval(intervalTimeId);
    }, 1000);
  }

  // получение скорости (миллисекунды) в соответствии с уровнем
  _getSpeed() {
    if (this.isSpeedFrozen) return this.speed;
    if (this.level === 0) return 1000;
    let tempSpeed = 1000 - 30 * this.level;
    if (tempSpeed < 100) return 100;
    return tempSpeed;
  }

  // увеличение скорости вручную
  speedUp() {
    if (!this.isSpeedFrozen) return;
    this.speed += 30;
    this._renderingSpeed();
    if (!this.isPause) this._setIntervalSpeed();
  }

  // уменьшение скорости вручную
  speedDown() {
    if (!this.isSpeedFrozen) return;
    if (this.speed <= 50) return;
    this.speed -= 30;
    this._renderingSpeed();
    if (!this.isPause) this._setIntervalSpeed();
  }

  // устоновление уровня в соответствии с колличеством набранных очков
  _setLevel() {
    if (this.level <= 5) {
      this.level = Math.trunc(this.score / 500);
    } else if (this.level > 5 && this.level <= 15) {
      let tempLevel = this.level - 5;
      this.level =
        this.level + Math.trunc((this.score - 2500 - tempLevel * 1000) / 1000);
    } else {
      let tempLevel = this.level - 15;
      this.level =
        this.level + Math.trunc((this.score - 12500 - tempLevel * 2000) / 2000);
    }
  }

  // установка скорости отображения элементов
  _setIntervalSpeed() {
    if (this.intervalSpeedId) {
      clearInterval(this.intervalSpeedId);
    }
    this.intervalSpeedId = setInterval(() => {
      this._renderingPlayingField();
      this._conditionalMovementTetromino();
      this._renderingTetromino();
      this.speed = this._getSpeed();
      this._renderingSpeed();
      if (this.gameOver) {
        clearInterval(this.intervalSpeedId);
      }
    }, this._getSpeed());
  }

  // переключение заморозки скорости
  toggleFreezeSpeed() {
    this.isSpeedFrozen
      ? (this.isSpeedFrozen = false)
      : (this.isSpeedFrozen = true);
    this._setIntervalSpeed();
  }

  // переключение color mode
  toggleColorMode() {
    if (this.isColorMod) {
      this.isColorMod = false;
      this._clearGameField();
      this._clearNextBrickField();
      this._renderingPlayingField();
      this._renderingTetromino();
      if (!this.gameOver) this._renderingNexBrick();
    } else {
      this.isColorMod = true;
      this._clearGameField();
      this._clearNextBrickField();
      this._renderingPlayingField();
      this._renderingTetromino();
      if (!this.gameOver) this._renderingNexBrick();
    }
  }

  // пауза в игре
  pause() {
    if (!this.isPause) {
      clearInterval(this.intervalSpeedId);
      clearInterval(this.intervalTimeId);
      this.isPause = true;
    } else {
      this._setIntervalSpeed();
      this._showTimeOfGame();
      this.isPause = false;
    }
  }

  showPauseModal() {
    this.modalPause.classList.remove("hidden");
    this.overlay.classList.remove("hidden");
  }

  showDonateModal() {
    this.modaleDonate.classList.remove("hidden");
    this.overlay.classList.remove("hidden");
  }

  reset() {
    if (this.intervalSpeedId) clearInterval(this.intervalSpeedId);
    if (this.intervalTimeId) clearInterval(this.intervalTimeId);
    this.level = 0;
    this.score = 0;
    this.lines = 0;
    this.time = 0;
    this.speed = 1000;
    this.gameOver = true;
    this.isPause = false;
    this.isReset = false;
    this.isSpeedFrozen = false;
    this.isDblDownPress = false;
    this.tetrominoSequence = [];
    this.nextBrick = undefined;
    this.playField = [];
    // заполняем массив нулями
    for (let row = -2; row < 20; row++) {
      this.playField[row] = [];

      for (let col = 0; col < 10; col++) {
        this.playField[row][col] = 0;
      }
    }
    this.tetromino = this._getNextTetromino();
    this._clearGameField();
    this._clearNextBrickField();
    this._renderingLevelScoreLines();
    this.timeDisplay.innerText = `${this.time}`;
  }

  init() {
    if (this.isReset) this.reset();
    this.gameOver = false;
    this._renderingLevelScoreLines();
    this._showTimeOfGame();
    this._renderingPlayingField();
    this._renderingTetromino();
    this._renderingNexBrick();
    this._setIntervalSpeed();
  }
}

export { TetrisApp };
