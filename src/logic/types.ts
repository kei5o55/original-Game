// src/logic/types.ts
import type { ItemId } from "./items";

export type ItemType = "heal" | "reveal" | "shield" | "key";

export type ItemLogEntry = {
  itemId: ItemId;
  chapter: ChapterId;
  obtainedAt: number; // Date.now()
};



export type Cell = {
  x: number;
  y: number;
  hasMine: boolean;
  isOpen: boolean;
  isFlagged: boolean;
  neighborMines: number;

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

export type EnemyId = "scout" | "guard" | "stalker";

export type EnemyDef = {
  id: EnemyId;
  name: string;
  sprite: string; // 絵文字でOK（画像パスでも可）
  atk: number;
  maxHp: number;
  speed?: number; // 任意
};

// 敵：巡回だけに必要な最小
export type EnemyState = {
  uid: string; // 章内で一意（"c1-e1" など）
  enemyId: EnemyId; // とりあえず string でOK（後で union にしても良い）
  route: { x: number; y: number }[];
  idx: number; // route の現在位置
  hp: number;
};

export type ChapterId = "chapter1" | "chapter2" | "chapter3" | "chapter4";


