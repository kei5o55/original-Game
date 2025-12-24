import type { ChapterId } from "./types";

export type ChapterConfig = {
  rows: number;
  cols: number;
  mines: number;
  requiredEvents: number;
  maxHp: number;
};

export const CHAPTER_CONFIG: Record<ChapterId, ChapterConfig> = {
  chapter1: {
    rows: 9,
    cols: 9,
    mines: 10,
    requiredEvents: 3,
    maxHp: 3,
  },
  chapter2: {
    rows: 12,
    cols: 12,
    mines: 18,
    requiredEvents: 5,
    maxHp: 3,
  },
  chapter3: {
    rows: 16,
    cols: 16,
    mines: 28,
    requiredEvents: 7,
    maxHp: 4,
  },
  chapter4: {
    rows: 16,
    cols: 16,
    mines: 28,
    requiredEvents: 7,
    maxHp: 4,
  },
};
