// src/logic/types.ts
import type { ItemId } from "./items";

export type ItemType = "heal" | "reveal" | "shield" | "key";


export type Cell = {
  x: number;
  y: number;
  hasMine: boolean;
  isOpen: boolean;
  isFlagged: boolean;
  neighborMines: number;

  item?: ItemType;
  hasPlayer?: boolean; 
  eventId?:string;
  isGoal?:boolean;
  // 追加
  itemId?: ItemId;
};

export type StoryLogItem =
  | { type: "text"; message: string }
  | { type: "image"; src: string; alt?: string }
  | { type: "event"; title: string; image: string; message?: string };
export type GameStatus = "playing" | "won" | "lost";

export type Enemy = {
  id: string;
  route: { x: number; y: number }[];
  idx: number; // 今のルートindex
};

export type ChapterId = "chapter1" | "chapter2" | "chapter3" | "chapter4";


