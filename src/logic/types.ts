// src/logic/types.ts

export type Cell = {
  x: number;
  y: number;
  hasMine: boolean;
  isOpen: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

export type GameStatus = "playing" | "won" | "lost";
