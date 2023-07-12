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

class TetrisApp {
  playField = [];
  tetrominoSequence = [];
  score = 0;
  lines = 0;
  gameOver = false;

  constructor(playingFieldCells, nextBrickFieldCells) {
    // заполняем сразу массив пустыми ячейками
    for (let row = -2; row < 20; row++) {
      this.playField[row] = [];

      for (let col = 0; col < 10; col++) {
        this.playField[row][col] = 0;
      }
    }
    this.playingFieldCells = Array.from(playingFieldCells);
    this.nextBrickFieldCells = Array.from(nextBrickFieldCells);
    this.tetromino = this._getNextTetromino();
  }

  _renderingPlayingField() {
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        const tempElem = this.playingFieldCells.find(
          (elem) => elem.id == `pf-${row}-${col}`
        );
        if (this.playField[row][col] == 1) {
          tempElem.classList.add("active-cell");
        } else if (this.playField[row][col] == 0) {
          tempElem.classList.remove("active-cell");
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

    // вот что возвращает функция
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
    // обрабатываем все строки и столбцы в игровом поле
    for (let row = 0; row < this.tetromino.matrix.length; row++) {
      for (let col = 0; col < this.tetromino.matrix[row].length; col++) {
        if (this.tetromino.matrix[row][col]) {
          // если край фигуры после установки вылезает за границы поля, то игра закончилась
          if (this.tetromino.row + row < 0) {
            return this._showGameOver();
          }
          // если всё в порядке, то записываем в массив игрового поля нашу фигуру
          this.playField[this.tetromino.row + row][
            this.tetromino.col + col
          ] = 1;
          this._renderingPlayingField();
        }
      }
    }

    // проверяем, чтобы заполненные ряды очистились снизу вверх
    for (let row = this.playField.length - 1; row >= 0; ) {
      // если ряд заполнен
      if (this.playField[row].every((cell) => !!cell)) {
        // очищаем его и опускаем всё вниз на одну клетку
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
  }

  // показываем надпись Game Over
  _showGameOver() {
    this.gameOver = true;
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
          // и снова рисуем на один пиксель меньше
          if (this.tetromino.row + row >= 0 && this.tetromino.col + col >= 0) {
            // console.log(
            //   `pf-${this.tetromino.row + row}-${this.tetromino.col + col}`
            // );
            const tempElem = this.playingFieldCells.find(
              (elem) =>
                elem.id ==
                `pf-${this.tetromino.row + row}-${this.tetromino.col + col}`
            );
            tempElem.classList.add("active-cell");
          }
        }
      }
    }
  }

  init() {
    this._renderingPlayingField();
    this._renderingTetromino();
    const intervalId = setInterval(() => {
      this._renderingPlayingField();
      this._conditionalMovementTetromino();
      this._renderingTetromino();
      if (this.gameOver) {
        clearInterval(intervalId);
      }
    }, 500);
  }
}

export { TetrisApp };
