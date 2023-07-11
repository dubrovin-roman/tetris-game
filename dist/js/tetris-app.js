"use strict";

import { TetrisApp } from "./TetrisAppClass.js";

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
};
