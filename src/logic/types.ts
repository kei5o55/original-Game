// src/logic/types.ts
export type ItemType = "heal" | "reveal" | "shield";

export type Cell = {
  x: number;
  y: number;
  hasMine: boolean;
  isOpen: boolean;
  isFlagged: boolean;
  neighborMines: number;

  item?: ItemType; // ★追加
  // hasPlayer?: boolean; // A方式なら不要
};

export type StoryLogItem =
  | { type: "text"; message: string }
  | { type: "image"; src: string; alt?: string }
  | { type: "event"; title: string; image: string; message?: string };

export type GameStatus = "playing" | "won" | "lost";

export type ChapterId = "chapter1" | "chapter2" | "chapter3" | "chapter4";


