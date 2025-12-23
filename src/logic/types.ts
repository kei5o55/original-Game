// src/logic/types.ts

export type Cell = {
  x: number;
  y: number;
  hasMine: boolean;
  isOpen: boolean;
  isFlagged: boolean;
  neighborMines: number;
  hasPlayer: boolean;
};

export type GameStatus = "playing" | "won" | "lost";

export type ChapterId = "chapter1" | "chapter2" | "chapter3" | "chapter4";


